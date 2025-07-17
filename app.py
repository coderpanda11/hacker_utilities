from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

class BinaryLearner:
    def __init__(self, num_plates=10):
        self.num_plates = num_plates
        self.plates = [0] * num_plates  # Initialize all plates to 0
        self.current_decimal = 0
        self.history = []
    
    def flip_plate(self, position):
        """Flip a plate at given position (0-indexed from right)"""
        if 0 <= position < self.num_plates:
            self.plates[-(position + 1)] = 1 - self.plates[-(position + 1)]
            self.update_decimal()
            self.add_to_history()
    
    def update_decimal(self):
        """Calculate decimal value from binary plates"""
        self.current_decimal = 0
        for i, plate in enumerate(reversed(self.plates)):
            self.current_decimal += plate * (2 ** i)
    
    def add_to_history(self):
        """Add current state to history"""
        self.history.append({
            'binary': ''.join(map(str, self.plates)),
            'decimal': self.current_decimal,
            'step': len(self.history) + 1
        })
    
    def reset(self):
        """Reset all plates to 0"""
        self.plates = [0] * self.num_plates
        self.current_decimal = 0
        self.history = []
    
    def set_decimal(self, decimal_value):
        """Set plates to represent a specific decimal value"""
        if 0 <= decimal_value < 2**self.num_plates:
            binary_str = format(decimal_value, f'0{self.num_plates}b')
            self.plates = [int(bit) for bit in binary_str]
            self.update_decimal()
            self.add_to_history()
            return True
        return False
    
    def get_binary_string(self):
        """Get current binary representation as string"""
        return ''.join(map(str, self.plates))
    
    def get_powers_of_two(self):
        """Get powers of two for each position"""
        return [2**i for i in range(self.num_plates-1, -1, -1)]


class HexadecimalLearner:
    def __init__(self, num_plates=7):
        self.num_plates = num_plates
        self.plates = [0] * num_plates  # Each plate is a hex digit (0-15)
        self.current_decimal = 0
        self.history = []
    
    def flip_plate(self, position):
        """Increment a plate at given position (0-indexed from right), modulo 16"""
        if 0 <= position < self.num_plates:
            idx = -(position + 1)
            self.plates[idx] = (self.plates[idx] + 1) % 16
            self.update_decimal()
            self.add_to_history()
    
    def update_decimal(self):
        """Calculate decimal value from hexadecimal plates"""
        self.current_decimal = 0
        for i, plate in enumerate(reversed(self.plates)):
            self.current_decimal += plate * (16 ** i)
    
    def add_to_history(self):
        """Add current state to history"""
        self.history.append({
            'hex': self.get_hexadecimal_string(),
            'decimal': self.current_decimal,
            'step': len(self.history) + 1
        })
    
    def reset(self):
        """Reset all plates to 0"""
        self.plates = [0] * self.num_plates
        self.current_decimal = 0
        self.history = []
    
    def set_decimal(self, decimal_value):
        """Set plates to represent a specific decimal value in base 16"""
        if 0 <= decimal_value < 16**self.num_plates:
            hex_str = format(decimal_value, f'0{self.num_plates}X')
            self.plates = [int(x, 16) for x in hex_str]
            self.update_decimal()
            self.add_to_history()
            return True
        return False
    
    def get_hexadecimal_string(self):
        """Get current hexadecimal representation as string"""
        return ''.join(format(x, 'X') for x in self.plates)
    
    def get_powers_of_sixteen(self):
        """Get powers of sixteen for each position"""
        return [16**i for i in range(self.num_plates-1, -1, -1)]
    

# Global instance
binary_learner = BinaryLearner()
hexadecimal_learner = HexadecimalLearner()


# API endpoints for Binary Learner
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/state')
def get_binary_state():
    """Get current state of the binary learner"""
    return jsonify({
        'plates': binary_learner.plates,
        'decimal': binary_learner.current_decimal,
        'binary': binary_learner.get_binary_string(),
        'powers_of_two': binary_learner.get_powers_of_two(),
        'history': binary_learner.history[-10:],  # Last 10 steps
        'max_decimal': 2**binary_learner.num_plates - 1
    })

@app.route('/api/flip/<int:position>')
def flip_plate(position):
    """Flip a plate at given position"""
    binary_learner.flip_plate(position)
    return get_binary_state()

@app.route('/api/reset')
def reset():
    """Reset all plates"""
    binary_learner.reset()
    return get_binary_state()

@app.route('/api/set_decimal', methods=['POST'])
def set_decimal():
    """Set decimal value"""
    data = request.get_json()
    decimal_value = data.get('decimal', 0)
    success = binary_learner.set_decimal(decimal_value)
    return jsonify({'success': success, **get_binary_state().get_json()})

@app.route('/api/auto_increment')
def auto_increment():
    """Auto increment like in binary counting"""
    # Start from rightmost plate and flip
    position = 0
    while position < binary_learner.num_plates:
        if binary_learner.plates[-(position + 1)] == 0:
            binary_learner.flip_plate(position)
            break
        else:
            binary_learner.flip_plate(position)
            position += 1
    
    return get_binary_state()


# API endpoints for Hexadecimal Learner
@app.route('/api/hexadecimal/state')
def get_hexadecimal_state():
    """Get current state of the hexadecimal learner"""
    return jsonify({
        'plates': hexadecimal_learner.plates,
        'decimal': hexadecimal_learner.current_decimal,
        'hexadecimal': hexadecimal_learner.get_hexadecimal_string(),
        'powers_of_sixteen': hexadecimal_learner.get_powers_of_sixteen(),
        'history': hexadecimal_learner.history[-10:],
        'max_decimal': 16**hexadecimal_learner.num_plates - 1
    })

@app.route('/api/hexadecimal/flip/<int:position>')
def flip_hexadecimal_plate(position):
    """Flip a plate at given position"""
    hexadecimal_learner.flip_plate(position)
    return get_hexadecimal_state()

@app.route('/api/hexadecimal/reset')
def reset_hexadecimal():
    """Reset all plates"""
    hexadecimal_learner.reset()
    return get_hexadecimal_state()

@app.route('/api/hexadecimal/set_decimal', methods=['POST'])
def set_hexadecimal_decimal():
    """Set decimal value"""
    data = request.get_json()
    decimal_value = data.get('decimal', 0)
    success = hexadecimal_learner.set_decimal(decimal_value)
    return jsonify({'success': success, **get_hexadecimal_state().get_json()})

@app.route('/api/hexadecimal/auto_increment')
def auto_increment_hexadecimal():
    """Auto increment like in hexadecimal counting"""
    # Start from rightmost plate and flip
    position = 0
    while position < hexadecimal_learner.num_plates:
        if hexadecimal_learner.plates[-(position + 1)] == 0:
            hexadecimal_learner.flip_plate(position)
            break
        else:
            hexadecimal_learner.flip_plate(position)
            position += 1
    return get_hexadecimal_state()



    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
