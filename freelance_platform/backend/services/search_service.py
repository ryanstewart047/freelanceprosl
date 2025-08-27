from flask import current_app
from sqlalchemy import or_, desc, func, text
from models import db, User, Job, Skill, Proposal, Review
from enum import Enum

class SearchType(Enum):
    FREELANCER = 'freelancer'
    JOB = 'job'
    CLIENT = 'client'

class SearchService:
    @staticmethod
    def search_freelancers(query_params):
        """
        Search for freelancers based on various criteria
        """
        # Base query for freelancers
        query = User.query.filter_by(role='FREELANCER', is_active=True, email_verified=True)
        
        # Text search (skills, name, etc.)
        if 'q' in query_params and query_params['q']:
            search_term = f"%{query_params['q']}%"
            query = query.filter(
                or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    User.bio.ilike(search_term),
                    User.title.ilike(search_term),
                    User.skills_text.ilike(search_term)
                )
            )
        
        # Filter by skill
        if 'skill_id' in query_params and query_params['skill_id']:
            skill_ids = query_params['skill_id'] if isinstance(query_params['skill_id'], list) else [query_params['skill_id']]
            query = query.filter(User.skills.any(Skill.id.in_(skill_ids)))
        
        # Filter by experience level
        if 'experience_level' in query_params and query_params['experience_level']:
            query = query.filter(User.experience_level == query_params['experience_level'])
        
        # Filter by hourly rate range
        if 'min_rate' in query_params and query_params['min_rate']:
            query = query.filter(User.hourly_rate >= float(query_params['min_rate']))
        
        if 'max_rate' in query_params and query_params['max_rate']:
            query = query.filter(User.hourly_rate <= float(query_params['max_rate']))
        
        # Filter by location
        if 'location' in query_params and query_params['location']:
            query = query.filter(User.location.ilike(f"%{query_params['location']}%"))
        
        # Filter by availability
        if 'available' in query_params and query_params['available'] == 'true':
            query = query.filter(User.is_available == True)
        
        # Sorting
        sort_by = query_params.get('sort_by', 'rating')
        if sort_by == 'rating':
            query = query.order_by(desc(User.avg_rating))
        elif sort_by == 'hourly_rate_asc':
            query = query.order_by(User.hourly_rate)
        elif sort_by == 'hourly_rate_desc':
            query = query.order_by(desc(User.hourly_rate))
        elif sort_by == 'jobs_completed':
            query = query.order_by(desc(User.jobs_completed))
        else:
            # Default to rating
            query = query.order_by(desc(User.avg_rating))
        
        # Pagination
        page = int(query_params.get('page', 1))
        per_page = int(query_params.get('per_page', 20))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        results = {
            'freelancers': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page
        }
        
        return results
    
    @staticmethod
    def search_jobs(query_params):
        """
        Search for jobs based on various criteria
        """
        # Base query for active jobs
        query = Job.query.filter_by(status='ACTIVE')
        
        # Text search
        if 'q' in query_params and query_params['q']:
            search_term = f"%{query_params['q']}%"
            query = query.filter(
                or_(
                    Job.title.ilike(search_term),
                    Job.description.ilike(search_term),
                    Job.skills_required.ilike(search_term)
                )
            )
        
        # Filter by category
        if 'category' in query_params and query_params['category']:
            query = query.filter(Job.category == query_params['category'])
        
        # Filter by job type
        if 'job_type' in query_params and query_params['job_type']:
            query = query.filter(Job.job_type == query_params['job_type'])
        
        # Filter by skill
        if 'skill_id' in query_params and query_params['skill_id']:
            skill_ids = query_params['skill_id'] if isinstance(query_params['skill_id'], list) else [query_params['skill_id']]
            query = query.filter(Job.skills.any(Skill.id.in_(skill_ids)))
        
        # Filter by budget range
        if 'min_budget' in query_params and query_params['min_budget']:
            query = query.filter(Job.budget >= float(query_params['min_budget']))
        
        if 'max_budget' in query_params and query_params['max_budget']:
            query = query.filter(Job.budget <= float(query_params['max_budget']))
        
        # Filter by duration
        if 'duration' in query_params and query_params['duration']:
            query = query.filter(Job.duration == query_params['duration'])
        
        # Sorting
        sort_by = query_params.get('sort_by', 'created_at')
        if sort_by == 'created_at':
            query = query.order_by(desc(Job.created_at))
        elif sort_by == 'budget_asc':
            query = query.order_by(Job.budget)
        elif sort_by == 'budget_desc':
            query = query.order_by(desc(Job.budget))
        else:
            # Default to most recent
            query = query.order_by(desc(Job.created_at))
        
        # Pagination
        page = int(query_params.get('page', 1))
        per_page = int(query_params.get('per_page', 20))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        results = {
            'jobs': [job.to_dict() for job in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page
        }
        
        return results
    
    @staticmethod
    def search_clients(query_params):
        """
        Search for clients based on various criteria
        """
        # Base query for clients
        query = User.query.filter_by(role='CLIENT', is_active=True, email_verified=True)
        
        # Text search (name, company, etc.)
        if 'q' in query_params and query_params['q']:
            search_term = f"%{query_params['q']}%"
            query = query.filter(
                or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    User.company_name.ilike(search_term),
                    User.bio.ilike(search_term)
                )
            )
        
        # Filter by location
        if 'location' in query_params and query_params['location']:
            query = query.filter(User.location.ilike(f"%{query_params['location']}%"))
        
        # Sorting
        sort_by = query_params.get('sort_by', 'jobs_posted')
        if sort_by == 'jobs_posted':
            query = query.order_by(desc(User.jobs_posted))
        elif sort_by == 'rating':
            query = query.order_by(desc(User.avg_rating))
        else:
            # Default to most jobs posted
            query = query.order_by(desc(User.jobs_posted))
        
        # Pagination
        page = int(query_params.get('page', 1))
        per_page = int(query_params.get('per_page', 20))
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        results = {
            'clients': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page
        }
        
        return results
    
    @staticmethod
    def get_search_filters():
        """
        Get available search filters and options
        """
        # Get all skills
        skills = Skill.query.all()
        skill_options = [{'id': skill.id, 'name': skill.name} for skill in skills]
        
        # Job categories
        job_categories = db.session.query(Job.category).distinct().all()
        category_options = [category[0] for category in job_categories if category[0]]
        
        # Job types
        job_types = db.session.query(Job.job_type).distinct().all()
        job_type_options = [job_type[0] for job_type in job_types if job_type[0]]
        
        # Experience levels
        experience_levels = db.session.query(User.experience_level).filter(User.experience_level.isnot(None)).distinct().all()
        experience_options = [level[0] for level in experience_levels if level[0]]
        
        # Locations (top locations)
        locations = db.session.query(User.location, func.count(User.id).label('count')).filter(User.location.isnot(None)).group_by(User.location).order_by(text('count DESC')).limit(20).all()
        location_options = [location[0] for location in locations if location[0]]
        
        return {
            'skills': skill_options,
            'job_categories': category_options,
            'job_types': job_type_options,
            'experience_levels': experience_options,
            'locations': location_options
        }
    
    @staticmethod
    def auto_complete(query_params):
        """
        Auto-complete suggestions for search queries
        """
        search_type = query_params.get('type', SearchType.FREELANCER.value)
        q = query_params.get('q', '')
        
        if not q or len(q) < 2:
            return {'suggestions': []}
        
        search_term = f"%{q}%"
        limit = int(query_params.get('limit', 10))
        
        suggestions = []
        
        if search_type == SearchType.FREELANCER.value:
            # Skill name suggestions
            skill_results = Skill.query.filter(Skill.name.ilike(search_term)).limit(limit).all()
            suggestions.extend([skill.name for skill in skill_results])
            
            # Freelancer title suggestions
            title_results = db.session.query(User.title).filter(
                User.role == 'FREELANCER',
                User.title.ilike(search_term)
            ).distinct().limit(limit).all()
            suggestions.extend([title[0] for title in title_results if title[0]])
            
        elif search_type == SearchType.JOB.value:
            # Job title suggestions
            job_results = db.session.query(Job.title).filter(
                Job.title.ilike(search_term)
            ).distinct().limit(limit).all()
            suggestions.extend([title[0] for title in job_results if title[0]])
            
            # Job category suggestions
            category_results = db.session.query(Job.category).filter(
                Job.category.ilike(search_term)
            ).distinct().limit(limit).all()
            suggestions.extend([category[0] for category in category_results if category[0]])
            
        elif search_type == SearchType.CLIENT.value:
            # Company name suggestions
            company_results = db.session.query(User.company_name).filter(
                User.role == 'CLIENT',
                User.company_name.ilike(search_term)
            ).distinct().limit(limit).all()
            suggestions.extend([company[0] for company in company_results if company[0]])
        
        # Remove duplicates and limit results
        suggestions = list(dict.fromkeys(suggestions))[:limit]
        
        return {'suggestions': suggestions}
