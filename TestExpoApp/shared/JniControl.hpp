#ifndef _JNI_CONTROL_INCLUDE_H
#define _JNI_CONTROL_INCLUDE_H

#include <stdexcept>
#include "NativeCherryLib.hpp"
#include <jni.h>

class jni_control
{
public:
    jni_control(JavaVM* vm);

    ~jni_control() {}

    JavaVM* init_jnienv(JNIEnv** senv);

    bool uninit_jnienv();

    template <typename Exc_T>
    bool handle_jni_exception(Exc_T jni_data, JNIEnv** env);

    bool get_error_occured();

    void clear_error_occured();

    //env->FindClass(const char* "some/path") with nullptr handling
    jclass find_class(JNIEnv** env, const char* class_path);

    //env->CallObjectMethod(jobject object, jmethodID method_id) with nullptr handling
    jobject call_object_method(JNIEnv** env, jobject* object, jmethodID* id);
    jobject call_static_object_method(JNIEnv** env, jclass* s_class, jmethodID* id);

    //env->GetMethodID(jclass class, "fun_in_class", const char* "(args)ARGSargs"); with nullptr handling
    jmethodID get_method_id(JNIEnv** env, jclass* s_class, const char* method_id_name, const char* values);
    jmethodID get_static_method_id(JNIEnv** env, jclass* s_class, const char* method_id_name, const char* values);
private:
    bool _is_attached_flag = false;
    bool _error_occured = false;
    JavaVM* _gapp_vm = nullptr;
};

class jni_nullptr_exc : public std::runtime_error
{
public:
    jni_nullptr_exc(const char* msg, JNIEnv** env) : std::runtime_error(msg)
    {
        JNIEnv* senv = *env;

        if(senv->ExceptionOccurred() != NULL)
        {
            senv->ExceptionDescribe();
            senv->ExceptionClear();
        }
    }
};

#endif //_JNI_CONTROL_INCLUDE_H
