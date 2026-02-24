# Check and configure Apache or Nginx
apache_check=$(systemctl list-units --type=service | grep -E 'apache2.service|httpd.service')
nginx_check=$(systemctl list-units --type=service | grep nginx.service)

if [ -n "$apache_check" ]; then
  print_green "Apache is installed and running."
  if command -v apt > /dev/null 2>&1; then
    # Configure Apache for Ubuntu/Debian
    add-apt-repository ppa:ondrej/apache2 -y
    apt-get update && apt-get upgrade -y apache2
    systemctl restart apache2

    # Enable necessary Apache modules
    a2enmod proxy proxy_http proxy_http2 proxy_wstunnel ssl rewrite
    systemctl restart apache2
    chown_files=true

  elif command -v dnf > /dev/null 2>&1; then
    # Configure Apache for Fedora/AlmaLinux
    dnf install -y httpd mod_ssl httpd-tools
    systemctl enable --now httpd

    # Add necessary Apache modules
    echo 'LoadModule proxy_module modules/mod_proxy.so' | tee -a /etc/httpd/conf/httpd.conf
    echo 'LoadModule proxy_http_module modules/mod_proxy_http.so' | tee -a /etc/httpd/conf/httpd.conf
    echo 'LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so' | tee -a /etc/httpd/conf/httpd.conf
    echo 'LoadModule ssl_module modules/mod_ssl.so' | tee -a /etc/httpd/conf.d/ssl.conf
    echo 'LoadModule rewrite_module modules/mod_rewrite.so' | tee -a /etc/httpd/conf/httpd.conf
    systemctl restart httpd

  elif command -v yum > /dev/null 2>&1; then
    # Configure Apache for CentOS/RHEL
    yum install -y httpd mod_ssl
    systemctl enable --now httpd

    # Enable necessary Apache modules
    sed -i '/^#LoadModule proxy_module/s/^#//' /etc/httpd/conf.modules.d/00-proxy.conf
    sed -i '/^#LoadModule proxy_http_module/s/^#//' /etc/httpd/conf.modules.d/00-proxy.conf
    sed -i '/^#LoadModule proxy_wstunnel_module/s/^#//' /etc/httpd/conf.modules.d/00-proxy.conf
    sed -i '/^#LoadModule ssl_module/s/^#//' /etc/httpd/conf.modules.d/00-ssl.conf
    sed -i '/^#LoadModule rewrite_module/s/^#//' /etc/httpd/conf.modules.d/00-base.conf
    systemctl restart httpd
    chown_files=true
  fi

else
  print_red "Neither Apache nor Nginx is installed."
  exit 1
fi
