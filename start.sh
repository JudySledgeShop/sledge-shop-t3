#!bin/bash


docker-compose up -d 
npx prisma generate
npx prisma db push
npm run dev