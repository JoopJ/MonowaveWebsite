# Monowave Website

A small static site with a contact form and gallery.

---

## Features

- **Static frontend** — uses HTML, CSS, and vanilla JS.
- **Contact form**
  - Posts to  `/contact` backend on a Raspberry Pi.
  - Automatically forwards to [Formspree](https://formspree.io/) which send to an email
  - Submissions are stored locally as a backup

## Hosting

1. Install nginx

   ```
   sudo apt update
   sudo apt install -y nginx
   ```
2. Deply sites file

   copy `index.html`, `styles.css`, `main.js`, the `images/` and `contact-api/` folders to: `/var/www/<project-name>`
3. Nginx config example

   ```
   server {
       listen 80;
       server_name yourdomain.com;

       root /var/www/<project-name>;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }

       location /contact {
           proxy_pass http://127.0.0.1:5000/contact;
       }
   }
   ```
