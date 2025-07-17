# Binary Learning with Interactive Plates

A Flask web application that teaches binary number representation through interactive visual plates. Learn how binary counting works by flipping plates that represent powers of 2.

## Features

- **Interactive Plates**: Click on circular plates to flip between 0 and 1
- **Real-time Conversion**: See decimal values update instantly as you flip plates
- **Auto Increment**: Simulate binary counting with automatic increment
- **Manual Input**: Set any decimal value and see its binary representation
- **History Tracking**: View recent changes and steps
- **Keyboard Shortcuts**: Use keys 0-6 to flip plates, R to reset, Space to auto-increment
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. Install Python 3.7 or higher
2. Install Flask:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python app.py
   ```

4. Open your browser and go to `http://localhost:5000`

## How to Use

### Basic Operations
- **Flip Plates**: Click on any plate to toggle between 0 and 1
- **Reset**: Click "Reset" to set all plates to 0
- **Auto Increment**: Click "Auto Increment" to simulate binary counting
- **Random**: Click "Random" to set a random decimal value

### Understanding the Interface
- Each plate represents a power of 2 (from 2^6 to 2^0)
- Red plates show 0, Green plates show 1
- The binary display shows the current binary number
- The decimal display shows the equivalent decimal value

### Keyboard Shortcuts
- `0-6`: Flip plates at positions 0-6
- `R`: Reset all plates
- `Space`: Auto increment

## Educational Value

This tool helps students understand:
- How binary numbers work
- The relationship between binary and decimal
- Powers of 2 and their positions
- Binary counting patterns
- How computers represent numbers

## API Endpoints

- `GET /api/state` - Get current state
- `GET /api/flip/<position>` - Flip plate at position
- `GET /api/reset` - Reset all plates
- `GET /api/auto_increment` - Auto increment binary value
- `POST /api/set_decimal` - Set decimal value

## Customization

You can easily modify:
- Number of plates (change `num_plates` in BinaryLearner)
- Colors and styling (edit CSS in `templates/index.html`)
- Add more features like different number bases
- Add sound effects or animations

## Example Binary Learning Sequence

1. Start with 0000000 (decimal 0)
2. Flip rightmost plate: 0000001 (decimal 1)
3. Flip rightmost plate again: 0000010 (decimal 2)
4. Flip rightmost plate: 0000011 (decimal 3)
5. Continue to see the pattern...

This follows the exact binary counting pattern you described!
