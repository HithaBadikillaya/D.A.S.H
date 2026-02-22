# Use Ubuntu as base
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    ffmpeg \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Clone whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git /whisper.cpp

# Build whisper.cpp
WORKDIR /whisper.cpp
RUN cmake -B build && cmake --build build

# Download base english model
RUN bash ./models/download-ggml-model.sh base.en

# Expose folder for audio
VOLUME ["/audio"]

# Set entrypoint
# We use a wrapper or just the bin. Let's use the bin.
ENTRYPOINT ["/whisper.cpp/build/bin/whisper-cli"]
CMD ["--help"]