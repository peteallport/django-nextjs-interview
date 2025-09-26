#!/bin/bash

echo "Setting up Activity Timeline project..."

# Backend setup
echo "Installing backend dependencies..."
cd server
pip3 install -r requirements.txt

echo "Running migrations..."
python3 manage.py migrate

echo "Loading person data..."
python3 manage.py ingest_persons data/persons.jsonl

echo "Loading activity events data..."
python3 manage.py ingest_activityevents data/account_31crr1tcp2bmcv1fk6pcm0k6ag.jsonl

echo "Starting Django server..."
python3 manage.py runserver &

cd ../client

echo "Installing frontend dependencies..."
npm install

echo "Starting Next.js development server..."
npm run dev


