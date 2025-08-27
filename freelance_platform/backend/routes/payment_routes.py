from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.payment_service import PaymentService, PaymentMethod
from models import User, db

payment_routes = Blueprint('payment', __name__)

@payment_routes.route('/create-transaction', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['amount', 'transaction_type']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
    
    # Validate payment method
    payment_method = data.get('payment_method', PaymentMethod.MOBILE_MONEY.value)
    if payment_method == PaymentMethod.MOBILE_MONEY.value:
        if 'mobile_money_provider' not in data or 'mobile_money_number' not in data:
            return jsonify({'success': False, 'message': 'Mobile money provider and number are required'}), 400
    
    # Add user_id to data
    data['user_id'] = user_id
    
    # Create transaction
    result = PaymentService.create_transaction(data)
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@payment_routes.route('/transactions/<transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    user_id = get_jwt_identity()
    
    # Get transaction
    result = PaymentService.get_transaction(transaction_id, user_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 404

@payment_routes.route('/transactions', methods=['GET'])
@jwt_required()
def get_user_transactions():
    user_id = get_jwt_identity()
    
    # Get query parameters
    query_params = request.args.to_dict()
    
    # Get user transactions
    results = PaymentService.get_user_transactions(user_id, query_params)
    
    return jsonify({'success': True, 'results': results}), 200

@payment_routes.route('/callback/<transaction_id>', methods=['POST'])
def payment_callback(transaction_id):
    # Get callback data
    callback_data = request.get_json()
    
    # Process callback
    result = PaymentService.process_payment_callback(transaction_id, callback_data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@payment_routes.route('/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    user_id = get_jwt_identity()
    
    # Get user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Get payment methods
    payment_methods = []
    
    # Add mobile money if available
    if user.mobile_money_number and user.mobile_money_provider:
        mobile_money = {
            'type': PaymentMethod.MOBILE_MONEY.value,
            'provider': user.mobile_money_provider,
            'number': user.mobile_money_number,
            'is_default': True
        }
        payment_methods.append(mobile_money)
    
    return jsonify({
        'success': True, 
        'payment_methods': payment_methods
    }), 200

@payment_routes.route('/payment-methods', methods=['POST'])
@jwt_required()
def add_payment_method():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if 'type' not in data:
        return jsonify({'success': False, 'message': 'Payment method type is required'}), 400
    
    # Get user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Add payment method based on type
    if data['type'] == PaymentMethod.MOBILE_MONEY.value:
        if 'provider' not in data or 'number' not in data:
            return jsonify({'success': False, 'message': 'Provider and number are required for mobile money'}), 400
        
        user.mobile_money_provider = data['provider']
        user.mobile_money_number = data['number']
        
        try:
            db.session.commit()
            
            return jsonify({
                'success': True, 
                'message': 'Mobile money payment method added successfully',
                'payment_method': {
                    'type': PaymentMethod.MOBILE_MONEY.value,
                    'provider': user.mobile_money_provider,
                    'number': user.mobile_money_number,
                    'is_default': True
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error adding payment method: {str(e)}'}), 400
    else:
        return jsonify({'success': False, 'message': f'Unsupported payment method type: {data["type"]}'}), 400
