#!/usr/bin/env python3
"""
GA4 Portfolio Analytics Data Collector
ポートフォリオサイトのアクセス数を自動取得
"""

import os
import json
import configparser
from datetime import datetime, timedelta
from pathlib import Path
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)

# 定数定義
TOP_PAGES_LIMIT = 20
TOP_BROWSERS_LIMIT = 10


class GA4DataCollector:
    def __init__(self, config_path: str):
        self.config = configparser.ConfigParser()
        self.config.read(config_path, encoding='utf-8')
        
        self.credentials_path = self.config['DEFAULT']['GOOGLE_APPLICATION_CREDENTIALS']
        self.property_id = self.config['DEFAULT']['PROPERTY_ID']
        self.output_dir = Path(self.config['DEFAULT']['OUTPUT_DIR'])
        self.log_dir = Path(self.config['DEFAULT']['LOG_DIR'])
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = self.credentials_path
        
        self.client = BetaAnalyticsDataClient()
    
    def log_message(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}"
        print(log_entry)
        
        log_file = self.log_dir / f"ga4_collect_{datetime.now().strftime('%Y%m%d')}.log"
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry + '\n')
    
    def get_report(self, start_date: str, end_date: str):
        """GA4レポートを取得"""
        request = RunReportRequest(
            property=f"properties/{self.property_id}",
            dimensions=[
                Dimension(name="date"),
                Dimension(name="pagePath"),
                Dimension(name="country"),
                Dimension(name="sessionSource"),
                Dimension(name="pageReferrer"),
                Dimension(name="landingPage"),
                Dimension(name="deviceCategory"),
                Dimension(name="browser"),
            ],
            metrics=[
                Metric(name="activeUsers"),
                Metric(name="sessions"),
                Metric(name="screenPageViews"),
                Metric(name="averageSessionDuration"),
            ],
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        )
        
        response = self.client.run_report(request)
        return response
    
    def get_project_clicks(self, start_date: str, end_date: str):
        """プロジェクト別クリックイベントを取得"""
        from google.analytics.data_v1beta.types import FilterExpression, Filter
        
        request = RunReportRequest(
            property=f"properties/{self.property_id}",
            dimensions=[
                Dimension(name="pagePath"),
                Dimension(name="linkUrl"),
            ],
            metrics=[
                Metric(name="eventCount"),
            ],
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            dimension_filter=FilterExpression(
                filter=Filter(
                    field_name="eventName",
                    string_filter=Filter.StringFilter(
                        match_type=Filter.StringFilter.MatchType.EXACT,
                        value="click"
                    )
                )
            )
        )
        
        response = self.client.run_report(request)
        return response
    
    def parse_response(self, response):
        """レスポンスをパース"""
        data = []
        
        for row in response.rows:
            entry = {
                'date': row.dimension_values[0].value,
                'page_path': row.dimension_values[1].value,
                'country': row.dimension_values[2].value,
                'session_source': row.dimension_values[3].value,
                'page_referrer': row.dimension_values[4].value,
                'landing_page': row.dimension_values[5].value,
                'device_category': row.dimension_values[6].value,
                'browser': row.dimension_values[7].value,
                'active_users': int(row.metric_values[0].value),
                'sessions': int(row.metric_values[1].value),
                'page_views': int(row.metric_values[2].value),
                'avg_session_duration': float(row.metric_values[3].value),
            }
            data.append(entry)
        
        return data
    
    def get_summary_stats(self, data):
        """サマリー統計を計算"""
        if not data:
            return {
                'total_users': 0,
                'total_sessions': 0,
                'total_page_views': 0,
                'unique_countries': 0,
                'unique_pages': 0,
                'unique_sources': 0,
            }
        
        total_users = sum(d['active_users'] for d in data)
        total_sessions = sum(d['sessions'] for d in data)
        total_page_views = sum(d['page_views'] for d in data)
        unique_countries = len(set(d['country'] for d in data))
        unique_pages = len(set(d['page_path'] for d in data))
        unique_sources = len(set(d['session_source'] for d in data if d['session_source'] != '(direct)'))
        
        return {
            'total_users': total_users,
            'total_sessions': total_sessions,
            'total_page_views': total_page_views,
            'unique_countries': unique_countries,
            'unique_pages': unique_pages,
            'unique_sources': unique_sources,
            'avg_page_views_per_session': round(total_page_views / total_sessions, 2) if total_sessions > 0 else 0,
        }
    
    def get_page_performance(self, data):
        """ページパフォーマンス分析
        
        GA4の averageSessionDuration は各行（日付・ページ・国等の組み合わせ）の平均値。
        ページ全体の正確な平均時間を計算するには、セッション数で加重平均を取る必要がある。
        
        計算式: 
        total_duration = Σ(avg_session_duration × sessions)
        avg_time = total_duration / total_sessions
        """
        page_performance = {}
        
        for row in data:
            page_path = row['page_path']
            if page_path not in page_performance:
                page_performance[page_path] = {
                    'users': 0,
                    'sessions': 0,
                    'page_views': 0,
                    'total_duration': 0.0,
                    'session_count': 0,
                }
            
            page_performance[page_path]['users'] += row['active_users']
            page_performance[page_path]['sessions'] += row['sessions']
            page_performance[page_path]['page_views'] += row['page_views']
            # 加重平均のため、セッション数を掛け算
            page_performance[page_path]['total_duration'] += row['avg_session_duration'] * row['sessions']
            page_performance[page_path]['session_count'] += row['sessions']
        
        # 集計とフォーマットを同時に実行（効率化）
        performance_list = []
        for path, stats in page_performance.items():
            avg_time = stats['total_duration'] / stats['session_count'] if stats['session_count'] > 0 else 0
            performance_list.append({
                'page_path': path,
                'users': stats['users'],
                'sessions': stats['sessions'],
                'page_views': stats['page_views'],
                'avg_time_seconds': round(avg_time, 2),
                'avg_time_formatted': f"{int(avg_time // 60)}m {int(avg_time % 60)}s",
            })
        
        # ソートして上位N件を返す
        performance_list.sort(key=lambda x: x['avg_time_seconds'], reverse=True)
        return performance_list[:TOP_PAGES_LIMIT]
    
    def _aggregate_stats(self, data, dimension_key):
        """ディメンション別の統計を集計（共通ロジック）
        
        注意: 同一ユーザーが複数の値を持つディメンションの場合、
        重複カウントされる可能性があります。
        """
        stats = {}
        for row in data:
            key = row[dimension_key]
            if key not in stats:
                stats[key] = {'users': 0, 'sessions': 0, 'page_views': 0}
            stats[key]['users'] += row['active_users']
            stats[key]['sessions'] += row['sessions']
            stats[key]['page_views'] += row['page_views']
        return stats
    
    def get_device_browser_stats(self, data):
        """Device & Browser分析
        
        注意: 同一ユーザーが複数デバイス・ブラウザを使用している場合、
        各デバイス・ブラウザで重複カウントされます。
        そのため、各デバイス・ブラウザのユーザー数合計は
        summary.total_users とは一致しません（合計の方が多くなります）。
        
        例: ユーザーAがデスクトップ（Chrome）とモバイル（Safari）でアクセス
        → Desktop: 1ユーザー、Mobile: 1ユーザー、合計: 2ユーザー
        　（実際の総ユーザー数は1ユーザー）
        
        これはGA4のディメンション別集計の仕様上、避けられません。
        """
        # 共通化関数を使用
        device_stats = self._aggregate_stats(data, 'device_category')
        browser_stats = self._aggregate_stats(data, 'browser')
        
        total_users = sum(s['users'] for s in device_stats.values())
        
        device_list = []
        for device, stats in sorted(device_stats.items(), key=lambda x: x[1]['users'], reverse=True):
            device_list.append({
                'device': device,
                'users': stats['users'],
                'sessions': stats['sessions'],
                'page_views': stats['page_views'],
                'percentage': round(stats['users'] / total_users * 100, 1) if total_users > 0 else 0,
            })
        
        browser_list = []
        for browser, stats in sorted(browser_stats.items(), key=lambda x: x[1]['users'], reverse=True)[:TOP_BROWSERS_LIMIT]:
            browser_list.append({
                'browser': browser,
                'users': stats['users'],
                'sessions': stats['sessions'],
                'page_views': stats['page_views'],
                'percentage': round(stats['users'] / total_users * 100, 1) if total_users > 0 else 0,
            })
        
        return {
            'devices': device_list,
            'browsers': browser_list,
        }
    
    def save_data(self, data, summary, project_clicks, project_page_views, page_performance, device_browser, start_date, end_date):
        """データを保存"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        output = {
            'collected_at': datetime.now().isoformat(),
            'period': {
                'start_date': start_date,
                'end_date': end_date,
            },
            'summary': summary,
            'details': data,
            'project_clicks': project_clicks,
            'project_page_views': project_page_views,
            'page_performance': page_performance,
            'device_browser': device_browser,
        }
        
        json_file = self.output_dir / f"ga4_data_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        latest_file = self.output_dir / "latest.json"
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        self.log_message(f"データ保存完了: {json_file}")
        return json_file
    
    def collect(self, days: int = 30):
        """データ収集を実行"""
        try:
            self.log_message(f"GA4データ収集開始（過去{days}日間）")
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            start_str = start_date.strftime('%Y-%m-%d')
            end_str = end_date.strftime('%Y-%m-%d')
            
            self.log_message(f"期間: {start_str} 〜 {end_str}")
            
            response = self.get_report(start_str, end_str)
            
            self.log_message(f"データ取得成功: {len(response.rows)} 行")
            
            data = self.parse_response(response)
            summary = self.get_summary_stats(data)
            
            self.log_message(f"サマリー: ユーザー数={summary['total_users']}, セッション数={summary['total_sessions']}, PV数={summary['total_page_views']}")
            
            # プロジェクトクリックデータを取得
            self.log_message("プロジェクトクリックデータ取得中...")
            project_clicks_response = self.get_project_clicks(start_str, end_str)
            project_clicks_raw = {}
            for row in project_clicks_response.rows:
                page_path = row.dimension_values[0].value
                link_url = row.dimension_values[1].value
                clicks = int(row.metric_values[0].value)
                
                # /portfolio/projects.html からの外部リンククリックのみ集計
                if '/portfolio/projects' in page_path and ('http' in link_url or 'github' in link_url):
                    if link_url not in project_clicks_raw:
                        project_clicks_raw[link_url] = 0
                    project_clicks_raw[link_url] += clicks
            
            # プロジェクト名でグループ化
            project_clicks = []
            for url, clicks in sorted(project_clicks_raw.items(), key=lambda x: x[1], reverse=True):
                project_name = "Unknown"
                if 'sound-platform' in url:
                    project_name = "Sound Platform"
                elif 'ai-trend' in url:
                    project_name = "AI Trend Dashboard"
                elif 'github.com' in url:
                    project_name = "GitHub Repository"
                
                project_clicks.append({
                    'project': project_name,
                    'url': url,
                    'clicks': clicks
                })
            
            self.log_message(f"プロジェクトクリック取得: {len(project_clicks)} 項目")
            
            # プロジェクトページビューを集計
            self.log_message("プロジェクトページビュー集計中...")
            project_page_views = {}
            for row in data:
                page_path = row['page_path']
                # /portfolio/projects配下のページを集計
                if '/portfolio/projects' in page_path or 'sound-platform' in page_path.lower() or 'ai-trend' in page_path.lower():
                    if page_path not in project_page_views:
                        project_page_views[page_path] = {
                            'users': 0,
                            'sessions': 0,
                            'page_views': 0,
                        }
                    project_page_views[page_path]['users'] += row['active_users']
                    project_page_views[page_path]['sessions'] += row['sessions']
                    project_page_views[page_path]['page_views'] += row['page_views']
            
            # プロジェクトページビューを配列に変換
            project_page_views_list = []
            for path, stats in sorted(project_page_views.items(), key=lambda x: x[1]['page_views'], reverse=True):
                project_page_views_list.append({
                    'page_path': path,
                    'users': stats['users'],
                    'sessions': stats['sessions'],
                    'page_views': stats['page_views'],
                })
            
            self.log_message(f"プロジェクトページビュー集計: {len(project_page_views_list)} ページ")
            
            # ページパフォーマンスを計算
            self.log_message("ページパフォーマンス分析中...")
            page_performance = self.get_page_performance(data)
            self.log_message(f"ページパフォーマンス分析: {len(page_performance)} ページ")
            
            # Device & Browser統計を計算
            self.log_message("Device & Browser分析中...")
            device_browser = self.get_device_browser_stats(data)
            self.log_message(f"Device種類: {len(device_browser['devices'])}, Browser種類: {len(device_browser['browsers'])}")
            
            output_file = self.save_data(data, summary, project_clicks, project_page_views_list, page_performance, device_browser, start_str, end_str)
            
            self.log_message("データ収集完了")
            
            return output_file
            
        except ConnectionError as e:
            self.log_message(f"ネットワークエラー: {str(e)}", "ERROR")
            self.log_message("再試行可能なエラーです。しばらく待ってから再実行してください。", "WARNING")
            raise
        except PermissionError as e:
            self.log_message(f"認証エラー: {str(e)}", "ERROR")
            self.log_message("認証情報（GOOGLE_APPLICATION_CREDENTIALS）を確認してください。", "ERROR")
            raise
        except ValueError as e:
            self.log_message(f"データ形式エラー: {str(e)}", "ERROR")
            self.log_message("GA4データの形式が不正です。ディメンション・メトリックの設定を確認してください。", "ERROR")
            raise
        except Exception as e:
            self.log_message(f"予期しないエラー発生: {type(e).__name__}: {str(e)}", "ERROR")
            raise


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='GA4 Portfolio Analytics Data Collector')
    parser.add_argument('--config', default='config.ini', help='設定ファイルのパス')
    parser.add_argument('--days', type=int, default=30, help='取得期間（日数）')
    
    args = parser.parse_args()
    
    config_path = args.config
    if not os.path.isabs(config_path):
        config_path = os.path.join(os.path.dirname(__file__), config_path)
    
    collector = GA4DataCollector(config_path)
    collector.collect(days=args.days)


if __name__ == '__main__':
    main()
