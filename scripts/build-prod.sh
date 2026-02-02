#!/bin/bash

# ================= 配置区 (请修改这里) =================
# 阿里云镜像仓库地址
REGISTRY_URL="crpi-emqag2foql120pnh.cn-beijing.personal.cr.aliyuncs.com"

# 命名空间
NAMESPACE="wendong-registry"

# 镜像版本 (默认使用 latest，也可以改为 git commit hash)
VERSION="latest"
# ======================================================

# 颜色输出
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}1. 正在登录阿里云镜像仓库...${NC}"
echo "请输入你的阿里云 Docker 仓库密码:"
docker login --username=热巴还是娜扎 $REGISTRY_URL

echo -e "${GREEN}2. 开始构建并推送 server-node...${NC}"
# 构建 (添加 --progress=plain 显示详细日志)
docker build --progress=plain -f apps/server-node/Dockerfile -t $REGISTRY_URL/$NAMESPACE/server-node:$VERSION .
# 推送
docker push $REGISTRY_URL/$NAMESPACE/server-node:$VERSION

echo -e "${GREEN}3. 开始构建并推送 web-react...${NC}"
# 构建 (添加 --progress=plain 显示详细日志)
docker build --progress=plain -f apps/web-react/Dockerfile -t $REGISTRY_URL/$NAMESPACE/web-react:$VERSION .
# 推送
docker push $REGISTRY_URL/$NAMESPACE/web-react:$VERSION

echo -e "${GREEN}✅ 所有镜像已推送成功！${NC}"
echo -e "Server: $REGISTRY_URL/$NAMESPACE/server-node:$VERSION"
echo -e "Web:    $REGISTRY_URL/$NAMESPACE/web-react:$VERSION"
