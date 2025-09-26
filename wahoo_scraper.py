#!/usr/bin/env python3
"""
Wahoo Data Scraper
A Python script to scrape and analyze Wahoo fitness data using the official API.
"""

import requests
import json
import time
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from dataclasses import dataclass, asdict
import csv
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('wahoo_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class WahooUser:
    """Wahoo user data structure"""
    id: str
    first_name: str
    last_name: str
    email: str
    date_of_birth: str
    gender: str
    height: int
    weight: int
    timezone: str

@dataclass
class WahooActivity:
    """Wahoo activity data structure"""
    id: str
    name: str
    start_time: str
    end_time: str
    duration: int
    distance: float
    calories: int
    avg_heart_rate: int
    max_heart_rate: int
    avg_speed: float
    max_speed: float
    elevation_gain: float
    sport: str
    device_name: str

@dataclass
class WahooDevice:
    """Wahoo device data structure"""
    id: str
    name: str
    type: str
    model: str
    serial_number: str
    firmware_version: str
    battery_level: int
    last_sync: str

class WahooAPI:
    """Wahoo API client"""
    
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.wahooligan.com/v1"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make a request to the Wahoo API with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            raise
    
    def get_user(self) -> WahooUser:
        """Get user profile information"""
        logger.info("Fetching user profile...")
        data = self._make_request('/user')
        return WahooUser(**data)
    
    def get_devices(self) -> List[WahooDevice]:
        """Get connected devices"""
        logger.info("Fetching devices...")
        data = self._make_request('/devices')
        devices = data.get('devices', [])
        return [WahooDevice(**device) for device in devices]
    
    def get_activities(self, limit: int = 50, offset: int = 0) -> List[WahooActivity]:
        """Get activities with pagination"""
        logger.info(f"Fetching activities (limit: {limit}, offset: {offset})...")
        params = {'limit': limit, 'offset': offset}
        data = self._make_request('/activities', params)
        activities = data.get('activities', [])
        return [WahooActivity(**activity) for activity in activities]
    
    def get_activity_details(self, activity_id: str) -> Dict:
        """Get detailed activity data including GPS and sensor data"""
        logger.info(f"Fetching activity details for {activity_id}...")
        activity = self._make_request(f'/activities/{activity_id}')
        activity_data = self._make_request(f'/activities/{activity_id}/data')
        return {
            'activity': activity,
            'data': activity_data
        }
    
    def get_workouts(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get workout data"""
        logger.info(f"Fetching workouts (limit: {limit}, offset: {offset})...")
        params = {'limit': limit, 'offset': offset}
        data = self._make_request('/workouts', params)
        return data.get('workouts', [])
    
    def get_metrics(self, date_from: Optional[str] = None, date_to: Optional[str] = None) -> Dict:
        """Get fitness metrics for a date range"""
        logger.info(f"Fetching metrics from {date_from} to {date_to}...")
        params = {}
        if date_from:
            params['date_from'] = date_from
        if date_to:
            params['date_to'] = date_to
        return self._make_request('/metrics', params)

class WahooDataScraper:
    """Main data scraper class"""
    
    def __init__(self, access_token: str):
        self.api = WahooAPI(access_token)
        self.data = {}
    
    def scrape_all_data(self, activity_limit: int = 100) -> Dict:
        """Scrape all available data"""
        logger.info("Starting comprehensive data scrape...")
        
        try:
            # Scrape user data
            user = self.api.get_user()
            logger.info(f"User: {user.first_name} {user.last_name}")
            
            # Scrape devices
            devices = self.api.get_devices()
            logger.info(f"Found {len(devices)} devices")
            
            # Scrape activities
            activities = self.api.get_activities(limit=activity_limit)
            logger.info(f"Found {len(activities)} activities")
            
            # Scrape workouts
            workouts = self.api.get_workouts(limit=50)
            logger.info(f"Found {len(workouts)} workouts")
            
            # Scrape metrics (last 30 days)
            date_to = datetime.now().strftime('%Y-%m-%d')
            date_from = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            metrics = self.api.get_metrics(date_from, date_to)
            
            # Generate summary
            summary = self._generate_summary(activities)
            
            self.data = {
                'user': asdict(user),
                'devices': [asdict(device) for device in devices],
                'activities': [asdict(activity) for activity in activities],
                'workouts': workouts,
                'metrics': metrics,
                'summary': summary,
                'scraped_at': datetime.now().isoformat()
            }
            
            logger.info("Data scraping completed successfully!")
            return self.data
            
        except Exception as e:
            logger.error(f"Error during data scraping: {e}")
            raise
    
    def _generate_summary(self, activities: List[WahooActivity]) -> Dict:
        """Generate summary statistics from activities"""
        if not activities:
            return {
                'total_activities': 0,
                'total_distance_km': 0,
                'total_calories': 0,
                'total_duration_hours': 0,
                'avg_heart_rate': 0,
                'activities_by_sport': {},
                'recent_activities': []
            }
        
        total_distance = sum(activity.distance for activity in activities) / 1000  # Convert to km
        total_calories = sum(activity.calories for activity in activities)
        total_duration = sum(activity.duration for activity in activities) / 3600  # Convert to hours
        
        heart_rates = [activity.avg_heart_rate for activity in activities if activity.avg_heart_rate > 0]
        avg_heart_rate = sum(heart_rates) / len(heart_rates) if heart_rates else 0
        
        # Activities by sport
        sports = {}
        for activity in activities:
            sport = activity.sport or 'Unknown'
            sports[sport] = sports.get(sport, 0) + 1
        
        # Recent activities (last 5)
        recent = sorted(activities, key=lambda x: x.start_time, reverse=True)[:5]
        
        return {
            'total_activities': len(activities),
            'total_distance_km': round(total_distance, 2),
            'total_calories': total_calories,
            'total_duration_hours': round(total_duration, 2),
            'avg_heart_rate': round(avg_heart_rate),
            'activities_by_sport': sports,
            'recent_activities': [asdict(activity) for activity in recent]
        }
    
    def export_to_json(self, filename: str = None) -> str:
        """Export data to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'wahoo_data_{timestamp}.json'
        
        with open(filename, 'w') as f:
            json.dump(self.data, f, indent=2)
        
        logger.info(f"Data exported to {filename}")
        return filename
    
    def export_activities_to_csv(self, filename: str = None) -> str:
        """Export activities to CSV file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'wahoo_activities_{timestamp}.csv'
        
        if not self.data.get('activities'):
            logger.warning("No activities data to export")
            return ""
        
        with open(filename, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'id', 'name', 'start_time', 'end_time', 'duration', 'distance',
                'calories', 'avg_heart_rate', 'max_heart_rate', 'avg_speed',
                'max_speed', 'elevation_gain', 'sport', 'device_name'
            ])
            writer.writeheader()
            writer.writerows(self.data['activities'])
        
        logger.info(f"Activities exported to {filename}")
        return filename
    
    def print_summary(self):
        """Print a formatted summary to console"""
        if not self.data:
            logger.warning("No data available. Run scrape_all_data() first.")
            return
        
        summary = self.data['summary']
        user = self.data['user']
        
        print("\n" + "="*50)
        print("WAHOO FITNESS DATA SUMMARY")
        print("="*50)
        print(f"User: {user['first_name']} {user['last_name']}")
        print(f"Email: {user['email']}")
        print(f"Scraped: {self.data['scraped_at']}")
        print("\nOVERALL STATISTICS:")
        print(f"  Total Activities: {summary['total_activities']}")
        print(f"  Total Distance: {summary['total_distance_km']} km")
        print(f"  Total Calories: {summary['total_calories']:,}")
        print(f"  Total Duration: {summary['total_duration_hours']} hours")
        print(f"  Average Heart Rate: {summary['avg_heart_rate']} bpm")
        
        print("\nACTIVITIES BY SPORT:")
        for sport, count in summary['activities_by_sport'].items():
            print(f"  {sport}: {count}")
        
        print(f"\nCONNECTED DEVICES: {len(self.data['devices'])}")
        for device in self.data['devices']:
            print(f"  {device['name']} ({device['type']}) - Battery: {device['battery_level']}%")
        
        print("\nRECENT ACTIVITIES:")
        for activity in summary['recent_activities'][:3]:
            start_time = datetime.fromisoformat(activity['start_time'].replace('Z', '+00:00'))
            print(f"  {activity['name']} ({activity['sport']}) - {start_time.strftime('%Y-%m-%d')}")
        
        print("="*50)

def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(description='Wahoo Data Scraper')
    parser.add_argument('--token', required=True, help='Wahoo access token')
    parser.add_argument('--limit', type=int, default=100, help='Number of activities to fetch')
    parser.add_argument('--export-json', action='store_true', help='Export data to JSON')
    parser.add_argument('--export-csv', action='store_true', help='Export activities to CSV')
    parser.add_argument('--quiet', action='store_true', help='Suppress console output')
    
    args = parser.parse_args()
    
    if args.quiet:
        logging.getLogger().setLevel(logging.WARNING)
    
    try:
        # Initialize scraper
        scraper = WahooDataScraper(args.token)
        
        # Scrape data
        scraper.scrape_all_data(activity_limit=args.limit)
        
        # Print summary
        if not args.quiet:
            scraper.print_summary()
        
        # Export data if requested
        if args.export_json:
            scraper.export_to_json()
        
        if args.export_csv:
            scraper.export_activities_to_csv()
        
        logger.info("Scraping completed successfully!")
        
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
