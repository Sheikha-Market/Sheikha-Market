echo "CPU:" $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
echo "RAM:" $(free -m | awk '/Mem:/ {print $3}')
echo "FILES:" $(find /var/sheikha | wc -l)
