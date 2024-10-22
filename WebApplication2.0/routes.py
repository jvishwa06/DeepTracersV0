from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_required, current_user
from models import db, Contact, BlogPost, User
from datetime import datetime
from ai_api import detect_deepfake, get_supported_platforms
from werkzeug.utils import secure_filename
import os
import logging

main_bp = Blueprint('main', __name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@main_bp.route('/')
def index():
    supported_platforms = get_supported_platforms()
    return render_template('index.html', supported_platforms=supported_platforms)

@main_bp.route('/solutions')
def solutions():
    return render_template('solutions.html')

@main_bp.route('/use-cases')
def use_cases():
    return render_template('use_cases.html')

@main_bp.route('/resources')
def resources():
    try:
        latest_posts = BlogPost.query.order_by(BlogPost.created_at.desc()).limit(5).all()
        return render_template('resources.html', blog_posts=latest_posts)
    except Exception as e:
        logger.error(f"Error in resources route: {str(e)}")
        flash('An error occurred while loading the resources. Please try again later.', 'error')
        return render_template('resources.html', blog_posts=[])

@main_bp.route('/technology')
def technology():
    return render_template('technology.html')

@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        new_contact = Contact(name=name, email=email, message=message)
        db.session.add(new_contact)
        db.session.commit()
        
        flash('Your message has been sent successfully!', 'success')
        return redirect(url_for('main.contact'))
    
    return render_template('contact.html')

@main_bp.route('/dashboard')
@login_required
def dashboard():
    bar_data = {
        'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        'datasets': [{
            'label': 'Monthly Scans',
            'data': [12, 19, 3, 5, 2, 3],
            'backgroundColor': 'rgba(75, 192, 192, 0.6)'
        }]
    }
    
    pie_data = {
        'labels': ['Deepfakes', 'Authentic', 'Inconclusive'],
        'datasets': [{
            'data': [30, 50, 20],
            'backgroundColor': ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    }
    
    geo_data = {
        'US': 100,
        'CN': 80,
        'GB': 60,
        'DE': 40,
        'IN': 30
    }
    
    return render_template('dashboard.html', name=current_user.username, bar_data=bar_data, pie_data=pie_data, geo_data=geo_data)

@main_bp.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@main_bp.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    if request.method == 'POST':
        current_user.username = request.form.get('username')
        current_user.email = request.form.get('email')
        db.session.commit()
        flash('Your profile has been updated successfully!', 'success')
        return redirect(url_for('main.profile'))

@main_bp.route('/detect_deepfake', methods=['POST'])
def detect_deepfake_route():
    url = request.form.get('url')
    file = request.files.get('file')
    
    if not url and not file:
        return jsonify({"error": "No URL or file provided"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join('uploads', filename)
        file.save(file_path)
        result = detect_deepfake(file_path)
        os.remove(file_path)
    else:
        result = detect_deepfake(url)
    
    return jsonify(result)

@main_bp.route('/demos')
def demos():
    return render_template('demos.html')

@main_bp.route('/demo_kyc', methods=['POST'])
def demo_kyc():
    name = request.form.get('name')
    id_number = request.form.get('id_number')
    is_verified = len(name) > 3 and len(id_number) > 5
    return jsonify({"verified": is_verified})

@main_bp.route('/demo_media_verification', methods=['POST'])
def demo_media_verification():
    url = request.form.get('url')
    is_authentic = len(url) > 10 and '.' in url
    return jsonify({"authentic": is_authentic})

@main_bp.route('/demo_threat_intelligence', methods=['POST'])
def demo_threat_intelligence():
    ip_address = request.form.get('ip_address')
    threat_level = "High" if len(ip_address.split('.')) == 4 else "Low"
    return jsonify({"threat_level": threat_level})


@main_bp.route('/blog')
def blog():
    page = request.args.get('page', 1, type=int)
    per_page = 5
    blog_posts = BlogPost.query.order_by(BlogPost.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('blog.html', blog_posts=blog_posts)

@main_bp.route('/blog/<int:post_id>')
def blog_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    return render_template('blog_post.html', post=post)

@main_bp.route('/blog/create', methods=['GET', 'POST'])
@login_required
def create_blog_post():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        
        if not title or not content:
            flash('Title and content are required.', 'error')
            return redirect(url_for('main.create_blog_post'))
        
        new_post = BlogPost(title=title, content=content, author=current_user)
        db.session.add(new_post)
        db.session.commit()
        
        flash('Your blog post has been created!', 'success')
        return redirect(url_for('main.blog'))
    
    return render_template('create_blog_post.html')

@main_bp.route('/blog/search')
def search_blog():
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = 5
    blog_posts = BlogPost.query.filter(BlogPost.title.ilike(f'%{query}%') | BlogPost.content.ilike(f'%{query}%')) \
        .order_by(BlogPost.created_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)
    return render_template('blog.html', blog_posts=blog_posts, search_query=query)

@main_bp.route('/developer-doc')
def developer_doc():
    return render_template('developer.html')

