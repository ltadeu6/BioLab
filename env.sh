#!/bin/sh

export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export PATH="$ANDROID_HOME/emulator:$PATH"

# Isolar o cache do Gradle para evitar conflitos.
export GRADLE_USER_HOME=$(pwd)/.gradle

cordova run android
