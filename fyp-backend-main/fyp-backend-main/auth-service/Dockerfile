FROM alpine:latest

# Create the /app directory
RUN mkdir /app

# Copy the application into the /app directory
COPY authApp /app

# Set the working directory
WORKDIR /app

# Command to run the application
CMD ["/app/authApp"]
