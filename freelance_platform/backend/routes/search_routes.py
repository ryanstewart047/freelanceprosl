from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.search_service import SearchService, SearchType

search_routes = Blueprint('search', __name__)

@search_routes.route('/freelancers', methods=['GET'])
def search_freelancers():
    # Get query parameters
    query_params = request.args.to_dict(flat=False)
    
    # Convert multi-value parameters to lists
    for key, value in query_params.items():
        if len(value) == 1:
            query_params[key] = value[0]
    
    # Search for freelancers
    results = SearchService.search_freelancers(query_params)
    
    return jsonify({'success': True, 'results': results}), 200

@search_routes.route('/jobs', methods=['GET'])
def search_jobs():
    # Get query parameters
    query_params = request.args.to_dict(flat=False)
    
    # Convert multi-value parameters to lists
    for key, value in query_params.items():
        if len(value) == 1:
            query_params[key] = value[0]
    
    # Search for jobs
    results = SearchService.search_jobs(query_params)
    
    return jsonify({'success': True, 'results': results}), 200

@search_routes.route('/clients', methods=['GET'])
def search_clients():
    # Get query parameters
    query_params = request.args.to_dict(flat=False)
    
    # Convert multi-value parameters to lists
    for key, value in query_params.items():
        if len(value) == 1:
            query_params[key] = value[0]
    
    # Search for clients
    results = SearchService.search_clients(query_params)
    
    return jsonify({'success': True, 'results': results}), 200

@search_routes.route('/filters', methods=['GET'])
def get_search_filters():
    # Get available search filters
    filters = SearchService.get_search_filters()
    
    return jsonify({'success': True, 'filters': filters}), 200

@search_routes.route('/autocomplete', methods=['GET'])
def autocomplete():
    # Get query parameters
    query_params = request.args.to_dict()
    
    # Validate search type
    search_type = query_params.get('type', SearchType.FREELANCER.value)
    if search_type not in [t.value for t in SearchType]:
        return jsonify({'success': False, 'message': 'Invalid search type'}), 400
    
    # Get autocomplete suggestions
    suggestions = SearchService.auto_complete(query_params)
    
    return jsonify({'success': True, 'suggestions': suggestions}), 200
