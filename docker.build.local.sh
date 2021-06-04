#!/bin/bash
# Simple docker build for local development
REPO=express-la-to-ro-crate
TAG=latest

docker build -f Dockerfile -t $REPO:$TAG .
