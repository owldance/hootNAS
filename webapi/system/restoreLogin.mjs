/* restore normal login

Remove auto login and restore normal login

replace line starting with 'ExecStart' in /lib/systemd/system/getty@.service
  with the following line
  ExecStart=-/sbin/agetty -o '-p -- \\u' --noclear %I $TERM

remove line containing 'onlogin.sh' from /root/.profile

  */
