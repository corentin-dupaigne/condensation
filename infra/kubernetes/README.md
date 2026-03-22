### Push docker image

TAG=$(date +%Y%m%d-%H%M)

docker build -t myusername/my-app:$TAG .
docker push myusername/my-app:$TAG

This generates a tag based on date to avoid the need of managing a version count
(v1, v2, v2.1, etc) while keeping multiple tags to be able to rollback on a previous version
instead of relying on a single :latest image.