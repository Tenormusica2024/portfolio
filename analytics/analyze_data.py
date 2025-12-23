import json
from collections import defaultdict
from datetime import datetime

# JSONデータを読み込む
with open('data/latest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 日付別にデータを集計
portfolio_by_date = defaultdict(int)
zenn_by_date = defaultdict(int)

for entry in data['details']:
    date = entry['date']
    page_path = entry['page_path']
    page_views = entry['page_views']
    
    # 日付をYYYY-MM-DD形式に変換
    date_str = f"{date[:4]}-{date[4:6]}-{date[6:8]}"
    
    # ポートフォリオサイトかZenn記事か判定
    if page_path.startswith('/portfolio/'):
        portfolio_by_date[date_str] += page_views
    elif page_path.startswith('/tenormusica/'):
        zenn_by_date[date_str] += page_views

# 日付でソート
sorted_dates = sorted(set(list(portfolio_by_date.keys()) + list(zenn_by_date.keys())))

# 結果を表示
print("日付別アクセス数集計:")
print("-" * 80)
print(f"{'日付':<12} {'ポートフォリオ':>12} {'Zenn記事':>12} {'合計':>12}")
print("-" * 80)

total_portfolio = 0
total_zenn = 0

for date in sorted_dates:
    portfolio_views = portfolio_by_date.get(date, 0)
    zenn_views = zenn_by_date.get(date, 0)
    total_views = portfolio_views + zenn_views
    
    total_portfolio += portfolio_views
    total_zenn += zenn_views
    
    print(f"{date:<12} {portfolio_views:>12,} {zenn_views:>12,} {total_views:>12,}")

print("-" * 80)
print(f"{'合計':<12} {total_portfolio:>12,} {total_zenn:>12,} {total_portfolio + total_zenn:>12,}")

# グラフ用のJSONデータを作成
chart_data = {
    "dates": sorted_dates,
    "portfolio": [portfolio_by_date.get(date, 0) for date in sorted_dates],
    "zenn": [zenn_by_date.get(date, 0) for date in sorted_dates]
}

with open('data/chart_data.json', 'w', encoding='utf-8') as f:
    json.dump(chart_data, f, ensure_ascii=False, indent=2)

print("\nグラフ用データを data/chart_data.json に出力しました")
