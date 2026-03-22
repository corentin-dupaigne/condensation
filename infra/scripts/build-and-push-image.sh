TAG=$(date +%Y%m%d-%H%M)

docker build -t $1:$TAG .
docker push $1:$TAG

# usage: ./build-and-push-image.sh myusername/my-app
