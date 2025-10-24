#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import re
import os
import subprocess
from datetime import datetime
from pathlib import Path

ZENN_API_URL = "https://zenn.dev/api/articles?username=tenormusica&order=latest"
INDEX_HTML_PATH = Path(__file__).parent / "index.html"
GIT_REPO_PATH = Path(__file__).parent

def fetch_latest_article():
    try:
        # Zenn APIから最新記事を取得
        headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
        response = requests.get(ZENN_API_URL, headers=headers, timeout=10)
        response.encoding = 'utf-8'
        data = response.json()
        
        if not data.get('articles'):
            print("No articles found")
            return None
        
        latest = data['articles'][0]
        article_url = f"https://zenn.dev/tenormusica/articles/{latest['slug']}"
        
        # 記事ページから本文の最初の部分を取得
        article_response = requests.get(article_url, headers=headers, timeout=10)
        article_response.encoding = 'utf-8'
        article_soup = BeautifulSoup(article_response.text, 'html.parser')
        
        # 本文の最初の段落を説明文として取得
        content_divs = article_soup.find_all('p')
        description = ""
        for p in content_divs[:3]:  # 最初の3段落を取得
            text = p.get_text(strip=True)
            if text and len(text) > 20:  # 意味のあるテキストのみ
                description += text + "\n\n"
        
        if not description:
            description = latest.get('emoji', '') + " " + str(latest.get('body_letters_count', 0) // 400) + "分で読めます"
        
        # タイトルと説明文をUTF-8で正しく扱う
        title = latest['title']
        if isinstance(title, bytes):
            title = title.decode('utf-8')
        
        article_data = {
            'title': title,
            'description': description.strip(),
            'url': article_url,
            'published': latest.get('published_at', datetime.now().strftime('%Y-%m-%d'))
        }
        
        return article_data
        
    except Exception as e:
        print(f"Error fetching article: {e}")
        import traceback
        traceback.print_exc()
        return None

def update_index_html(article):
    if not INDEX_HTML_PATH.exists():
        print(f"Error: {INDEX_HTML_PATH} not found")
        return False
    
    with open(INDEX_HTML_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    article_section_pattern = r'(<div class="article-section">.*?<h2>最新投稿記事</h2>.*?<div class="article-card">.*?<h3 class="article-title">)(.*?)(</h3>.*?<p class="article-description">)(.*?)(</p>.*?<a href=")(.*?)(" class="article-link")'
    
    replacement = rf'\g<1>{article["title"]}\g<3>{article["description"]}\g<5>{article["url"]}\g<7>'
    
    new_content = re.sub(
        article_section_pattern,
        replacement,
        content,
        flags=re.DOTALL
    )
    
    if new_content == content:
        print("No changes detected - article is already up to date")
        return False
    
    with open(INDEX_HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated index.html with latest article: {article['title']}")
    return True

def git_commit_and_push():
    try:
        os.chdir(GIT_REPO_PATH)
        
        subprocess.run(['git', 'add', 'index.html'], check=True)
        
        commit_message = f"""Update latest Zenn article

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""
        
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)
        
        subprocess.run(['git', 'push', 'origin', 'main'], check=True)
        
        print("Successfully committed and pushed to GitHub")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")
        return False

def main():
    print(f"=== Zenn Article Update Script - {datetime.now()} ===")
    
    article = fetch_latest_article()
    if not article:
        print("Failed to fetch latest article")
        return
    
    print(f"Latest article: {article['title']}")
    print(f"Published: {article['published']}")
    print(f"URL: {article['url']}")
    
    if update_index_html(article):
        git_commit_and_push()
    else:
        print("No update needed")

if __name__ == "__main__":
    main()
