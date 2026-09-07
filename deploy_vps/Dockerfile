FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY server /app/server
COPY dist /app/web/dist
RUN chmod +x /app/server
EXPOSE 8089
ENTRYPOINT ["/app/server"]
