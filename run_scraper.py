#!/usr/bin/env python3
"""
Simple script to run the Wahoo scraper with token from environment or user input
"""

import os
import sys
from wahoo_scraper import WahooDataScraper

def main():
    # Try to get token from environment variable first
    access_token = os.getenv('WAHOO_ACCESS_TOKEN')
    
    if not access_token:
        print("Wahoo Data Scraper")
        print("================")
        print("Enter your Wahoo access token (or set WAHOO_ACCESS_TOKEN environment variable):")
        access_token = input("Token: ").strip()
        
        if not access_token:
            print("Error: No access token provided")
            return 1
    
    try:
        # Initialize and run scraper
        scraper = WahooDataScraper(access_token)
        
        print("\nStarting data scrape...")
        scraper.scrape_all_data()
        
        # Print summary
        scraper.print_summary()
        
        # Ask if user wants to export data
        export_choice = input("\nExport data? (json/csv/both/n): ").lower()
        
        if export_choice in ['json', 'both']:
            filename = scraper.export_to_json()
            print(f"JSON data exported to: {filename}")
        
        if export_choice in ['csv', 'both']:
            filename = scraper.export_activities_to_csv()
            if filename:
                print(f"CSV data exported to: {filename}")
        
        print("\nScraping completed successfully!")
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
