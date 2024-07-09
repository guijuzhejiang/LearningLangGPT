#!/bin/bash

# 设置代理
export http_proxy="http://127.0.0.1:7891"
export https_proxy="http://127.0.0.1:7891"

# 尝试访问 Google
curl --max-time 10  -o /dev/null -s -w "%{http_code}\n" https://www.google.com | grep "200" > /dev/null

# 检查访问是否成功
if [ $? -ne 0 ]; then
  # 如果失败，则尝试从数组中取值，直到成功
  json_file="/usr/local/share/shadowsocksr/config.json"

  # 读取数组
  values=("103.45.78.170" "120.233.27.129" "58.32.13.22" "103.45.78.164")  # 你的值数组
  echo "$value"
  for value in "${values[@]}"; do
    # 修改 JSON 文件中的值
    jq ".server = \"$value\"" "$json_file" > tmp.$$.json && mv tmp.$$.json "$json_file"

    # 重新设置代理并测试访问
    ssr stop
    ssr start
    #curl --max-time 10 -s --head --request GET https://www.google.com | grep "200 Connection established" > /dev/null
    curl --max-time 10  -o /dev/null -s -w "%{http_code}\n" https://www.google.com | grep "200" > /dev/null

    # 如果成功，退出循环
    if [ $? -eq 0 ]; then
      break
    fi
  done
fi