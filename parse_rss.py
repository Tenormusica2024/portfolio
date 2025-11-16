#!/usr/bin/env python3
import sys
import xml.etree.ElementTree as ET
import json
import re

def parse_zenn_rss():
    try:
        xml_content = sys.stdin.buffer.read().decode('utf-8', errors='ignore')
        root = ET.fromstring(xml_content)
        
        items = root.findall('.//item')
        if not items:
            return None
        
        latest = items[0]
        
        title = latest.find('title')
        link = latest.find('link')
        description = latest.find('description')
        
        title_text = title.text if title is not None else ''
        link_text = link.text if link is not None else ''
        desc_text = description.text if description is not None else ''
        
        clean_desc = re.sub(r'<[^>]+>', '', desc_text)
        clean_desc = clean_desc.strip()[:200]
        if len(desc_text.strip()) > 200:
            clean_desc += '...'
        
        article_data = {
            'title': title_text,
            'link': link_text,
            'description': clean_desc,
            'updated': True
        }
        
        output = json.dumps(article_data, ensure_ascii=False, indent=2)
        sys.stdout.buffer.write(output.encode('utf-8'))
        
    except Exception as e:
        fallback = {
            'title': 'Sora 2とGrok Imagine、どっちが使えるのか - 6秒動画と60秒動画の現実',
            'link': 'https://zenn.dev/tenormusica/articles/sora2-grok-video-generation-reality-2025',
            'description': 'Sora 2 is here | OpenAI\nhttps://openai.com/index/sora-2/\n\nxAI Grok Imagine 0.9 brings speed and quality improvements...',
            'updated': False,
            'error': str(e)
        }
        output = json.dumps(fallback, ensure_ascii=False, indent=2)
        sys.stdout.buffer.write(output.encode('utf-8'))

if __name__ == '__main__':
    parse_zenn_rss()
