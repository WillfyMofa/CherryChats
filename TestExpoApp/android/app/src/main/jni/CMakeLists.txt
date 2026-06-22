cmake_minimum_required(VERSION 3.13)

project(NativeCherryLib
  VERSION 1.0
  LANGUAGES CXX
)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

set(BOOST_INCLUDE_PATH ../../../../../shared/cpp_libs)

target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC ${BOOST_INCLUDE_PATH})

target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../shared/VmObject.cpp)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../shared/JniControl.cpp)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../shared/NativeCherryLib.cpp)
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC ../../../../../shared)
