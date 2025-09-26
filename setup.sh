#!/bin/bash

# Wahoo Data Scraper Setup Script
echo "🚀 Setting up Wahoo Data Scraper..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $python_version detected"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x wahoo_scraper.py
chmod +x run_scraper.py

# Check if Node.js is installed for Next.js
if command -v node &> /dev/null; then
    echo "✅ Node.js detected"
    
    # Install Node.js dependencies
    echo "📦 Installing Node.js dependencies..."
    npm install
    
    echo "🎉 Setup complete!"
    echo ""
    echo "To run the web application:"
    echo "  npm run dev"
    echo ""
    echo "To run the Python scraper directly:"
    echo "  python3 run_scraper.py"
    echo ""
    echo "To run with command line options:"
    echo "  python3 wahoo_scraper.py --token YOUR_TOKEN --export-json"
else
    echo "⚠️  Node.js not detected. Python scraper is ready to use."
    echo ""
    echo "To run the Python scraper:"
    echo "  python3 run_scraper.py"
    echo ""
    echo "To run with command line options:"
    echo "  python3 wahoo_scraper.py --token YOUR_TOKEN --export-json"
fi

echo ""
echo "📚 For more information, see PYTHON_SCRAPER_README.md"
