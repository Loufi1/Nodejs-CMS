#!/bin/zsh

printf 'Start testing...\n\n'

printf 'GET localhost:3000/test: '
curl -s -o /dev/null -w "%{http_code}" -X GET 'localhost:3000/test'
printf '\n'

printf 'POST localhost:3000/auth/signup: '
curl -s -o /dev/null -w " %{http_code}" -d '{"email":"loufi@gmail.com", "password":"admin"}' -H "Content-Type: application/json" -X POST 'localhost:3000/auth/signup'
printf '\n'

printf 'POST localhost:3000/auth/signin:\n'
output=$(curl -s -d '{"email":"loufi@gmail.com", "password":"admin"}' -H "Content-Type: application/json" -X POST 'localhost:3000/auth/signin')
token=$(echo $output | jq -r .access_token.token)
printf '\taccess token -> %s' $token
printf '\n'

if [[ $token = null ]]
then
    printf '\tlogged in -> false'
else
    printf '\tlogged in -> true'
fi

printf '\n'

printf 'POST localhost:3000/article:\n'
output=$(curl -s -d '{"title":"Hello World 3", "content":"lorem ipsum"}' -H "Authorization: jwt $token" -H "Content-Type: application/json" -X POST 'localhost:3000/article')
error=$(echo $output | jq -r .error)
printf '\terror -> %s' $error
printf '\n'

if [[ $error = null ]]
then
    printf '\tpost created -> true'
else
    printf '\tpost created -> false'
fi

printf '\n'