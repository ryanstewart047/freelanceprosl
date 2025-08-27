# Gunicorn configuration for FreelancePro SL backend
# Place this file in your Hostinger server directory

bind = "0.0.0.0:5000"  # Bind to all network interfaces on port 5000
workers = 3  # Number of worker processes (2 * num_cores + 1 is recommended)
timeout = 120  # Timeout in seconds
accesslog = "/home/username/logs/gunicorn-access.log"  # Replace username with your Hostinger username
errorlog = "/home/username/logs/gunicorn-error.log"    # Replace username with your Hostinger username
capture_output = True
loglevel = "info"
daemon = True  # Run in the background
pidfile = "/home/username/run/gunicorn.pid"  # Replace username with your Hostinger username

# SSL Configuration (if you're handling SSL at the application level)
# Uncomment these if you want Gunicorn to handle SSL directly
# certfile = "/home/username/ssl/cert.pem"
# keyfile = "/home/username/ssl/key.pem"
