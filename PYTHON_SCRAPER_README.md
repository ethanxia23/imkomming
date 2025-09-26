# Wahoo Data Scraper - Python Edition

A comprehensive Python script for scraping and analyzing Wahoo fitness data using the official Wahoo API. This scraper can be used standalone or integrated with your Next.js web application.

## Features

- 🐍 **Pure Python**: Built with Python 3.7+ and the `requests` library
- 📊 **Comprehensive Data**: Scrapes user profile, devices, activities, workouts, and metrics
- 💾 **Data Export**: Export data to JSON and CSV formats
- 🔄 **Error Handling**: Robust error handling with retry logic
- 📈 **Analytics**: Built-in summary statistics and activity analysis
- 🌐 **Web Integration**: Can be called from your Next.js application
- 📝 **Logging**: Detailed logging for debugging and monitoring

## Prerequisites

- Python 3.7 or higher
- Wahoo Developer Account and API credentials
- Access token from Wahoo OAuth flow

## Installation

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Make scripts executable** (optional):
   ```bash
   chmod +x wahoo_scraper.py
   chmod +x run_scraper.py
   ```

## Usage

### 1. Standalone Usage

#### Quick Start
```bash
python run_scraper.py
```

#### Command Line Interface
```bash
# Basic usage
python wahoo_scraper.py --token YOUR_ACCESS_TOKEN

# With custom limits and exports
python wahoo_scraper.py --token YOUR_ACCESS_TOKEN --limit 200 --export-json --export-csv

# Quiet mode (less output)
python wahoo_scraper.py --token YOUR_ACCESS_TOKEN --quiet
```

#### Environment Variable
```bash
export WAHOO_ACCESS_TOKEN="your_token_here"
python wahoo_scraper.py
```

### 2. Programmatic Usage

```python
from wahoo_scraper import WahooDataScraper

# Initialize scraper
scraper = WahooDataScraper("your_access_token")

# Scrape all data
data = scraper.scrape_all_data(activity_limit=100)

# Print summary
scraper.print_summary()

# Export data
scraper.export_to_json("my_data.json")
scraper.export_activities_to_csv("activities.csv")
```

### 3. Web Integration

The scraper can be called from your Next.js application via the `/api/wahoo/scrape` endpoint:

```javascript
const response = await fetch('/api/wahoo/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_token: 'your_token',
    limit: 100
  })
});

const result = await response.json();
```

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--token` | Wahoo access token (required) | - |
| `--limit` | Number of activities to fetch | 100 |
| `--export-json` | Export data to JSON file | False |
| `--export-csv` | Export activities to CSV file | False |
| `--quiet` | Suppress console output | False |

## Data Structure

### User Data
```python
@dataclass
class WahooUser:
    id: str
    first_name: str
    last_name: str
    email: str
    date_of_birth: str
    gender: str
    height: int
    weight: int
    timezone: str
```

### Activity Data
```python
@dataclass
class WahooActivity:
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
```

### Device Data
```python
@dataclass
class WahooDevice:
    id: str
    name: str
    type: str
    model: str
    serial_number: str
    firmware_version: str
    battery_level: int
    last_sync: str
```

## Output Files

### JSON Export
Complete data export including:
- User profile
- All devices
- All activities
- Workouts
- Metrics
- Summary statistics

### CSV Export
Activities-only export with columns:
- id, name, start_time, end_time
- duration, distance, calories
- avg_heart_rate, max_heart_rate
- avg_speed, max_speed, elevation_gain
- sport, device_name

## Summary Statistics

The scraper automatically generates:
- Total activities count
- Total distance (km)
- Total calories burned
- Total duration (hours)
- Average heart rate
- Activities breakdown by sport
- Recent activities list

## Error Handling

The scraper includes comprehensive error handling:
- Network timeouts and retries
- API rate limiting
- Invalid token handling
- Data validation
- File I/O errors

## Logging

Logs are written to:
- Console (INFO level)
- `wahoo_scraper.log` file (all levels)

Log levels:
- INFO: Normal operation
- WARNING: Non-critical issues
- ERROR: Critical errors

## Integration with Next.js

### API Route
The scraper integrates with your Next.js app via `/app/api/wahoo/scrape/route.ts`:

```typescript
// POST /api/wahoo/scrape
{
  "access_token": "your_token",
  "limit": 100
}
```

### Web Interface
Your Next.js app provides a web interface at the root page where users can:
- Enter their access token
- Trigger the Python scraper
- View results in a beautiful dashboard

## Deployment

### Local Development
1. Install Python dependencies
2. Run the Next.js app: `npm run dev`
3. Access the web interface at `http://localhost:3000`

### Production Deployment

#### Vercel (Recommended)
1. Ensure Python 3.7+ is available in your deployment environment
2. Install Python dependencies in your build process
3. Deploy your Next.js app with the Python scripts included

#### Other Platforms
- Ensure Python runtime is available
- Install dependencies during build
- Configure environment variables

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   pip install -r requirements.txt
   ```

2. **"Permission denied" errors**
   ```bash
   chmod +x wahoo_scraper.py
   ```

3. **"Invalid token" errors**
   - Verify your access token is valid
   - Check token expiration
   - Re-authenticate if needed

4. **"API rate limit" errors**
   - Wait before retrying
   - Reduce the `--limit` parameter
   - Implement proper rate limiting

5. **"Network timeout" errors**
   - Check internet connection
   - Verify Wahoo API is accessible
   - Check firewall settings

### Debug Mode
Enable detailed logging:
```bash
python wahoo_scraper.py --token YOUR_TOKEN --quiet
# Check wahoo_scraper.log for detailed logs
```

## Security Considerations

- Never commit access tokens to version control
- Use environment variables for sensitive data
- Implement proper token refresh logic
- Validate all input data
- Use HTTPS in production

## Performance Tips

- Use appropriate `--limit` values
- Cache data when possible
- Run during off-peak hours
- Monitor API rate limits
- Use `--quiet` mode for automated runs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [Wahoo API Documentation](https://developer.wahoofitness.com/)
- Open an issue in this repository
- Contact the development team

## Example Output

```
==================================================
WAHOO FITNESS DATA SUMMARY
==================================================
User: John Doe
Email: john@example.com
Scraped: 2024-01-15T10:30:00

OVERALL STATISTICS:
  Total Activities: 45
  Total Distance: 125.5 km
  Total Calories: 8,750
  Total Duration: 12.5 hours
  Average Heart Rate: 145 bpm

ACTIVITIES BY SPORT:
  Running: 25
  Cycling: 15
  Swimming: 5

CONNECTED DEVICES: 2
  Wahoo ELEMNT BOLT (bike_computer) - Battery: 85%
  Wahoo TICKR X (heart_rate_monitor) - Battery: 92%

RECENT ACTIVITIES:
  Morning Run (Running) - 2024-01-14
  Evening Bike Ride (Cycling) - 2024-01-13
  Pool Swim (Swimming) - 2024-01-12
==================================================
```
