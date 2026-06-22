#include "JniControl.hpp"

jni_control::jni_control(JavaVM* vm)
{
    _gapp_vm = vm;
}

JavaVM* jni_control::init_jnienv(JNIEnv** senv)
{
    JNIEnv* env = *senv;
    JNIEnv** envptr = &env;

    if(_gapp_vm == nullptr)
    {
        _gapp_vm = facebook::react::vm_object::get_g_vm();

        if(_gapp_vm == nullptr)
        {
            return nullptr;
        }
    }

    _is_attached_flag = false;

    jint error_handling_env = _gapp_vm->GetEnv((void**) envptr, JNI_VERSION_1_6);

    if(error_handling_env == JNI_EDETACHED)
    {
        jint error_handling_attach = _gapp_vm->AttachCurrentThread(envptr, 0);

        if(error_handling_attach != JNI_OK)
        {
            return nullptr;
        }

        _is_attached_flag = true;
    }
    else if(error_handling_env != JNI_OK)
    {
        return nullptr;
    }

    env = *envptr;
    *senv = env;

    return _gapp_vm;
}

bool jni_control::uninit_jnienv()
{
    if(_is_attached_flag == true)
    {
        jint error_handling_detach = _gapp_vm->DetachCurrentThread();

        if(error_handling_detach != JNI_OK)
        {
            _is_attached_flag = false;

            return 1;
        }
    }

    _is_attached_flag = false;

    return 0;
}

template <typename Exc_T>
bool jni_control::handle_jni_exception(Exc_T jni_data, JNIEnv** env)
{
    JNIEnv* senv = *env;

    if(jni_data == nullptr)
    {
        if(senv->ExceptionOccurred() != NULL)
        {
            senv->ExceptionDescribe();
            senv->ExceptionClear();
        }

        return 1;
    }

    return 0;
}

bool jni_control::get_error_occured()
{
    return _error_occured;
}

void jni_control::clear_error_occured()
{
    _error_occured = false;
}

jclass jni_control::find_class(JNIEnv** env, const char* class_path)
{
    JNIEnv* senv = *env;
    jclass temp = senv->FindClass(class_path);

    if(temp == nullptr)
    {
        throw jni_nullptr_exc("jclass nullptr exception", env);
    }

    return temp;
}

jobject jni_control::call_object_method(JNIEnv** env, jobject* object, jmethodID* id)
{
    JNIEnv* senv = *env;
    jobject temp = senv->CallObjectMethod(*object, *id);

    if(temp == nullptr)
    {
        throw jni_nullptr_exc("jobject nullptr exception", env);
    }

    return temp;
}

jobject jni_control::call_static_object_method(JNIEnv** env, jclass* s_class, jmethodID* id)
{
    JNIEnv* senv = *env;
    jobject temp = senv->CallStaticObjectMethod(*s_class, *id);

    if(temp == nullptr)
    {
        throw jni_nullptr_exc("jobject static nullptr exception", env);
    }

    return temp;
}

jmethodID jni_control::get_method_id(JNIEnv** env, jclass* s_class, const char* method_id_name, const char* values)
{
    JNIEnv* senv = *env;
    jmethodID temp = senv->GetMethodID(*s_class, method_id_name, values);

    if(temp == nullptr)
    {
        throw jni_nullptr_exc("jmethodID nullptr exception", env);
    }

    return temp;
}

jmethodID jni_control::get_static_method_id(JNIEnv** env, jclass* s_class, const char* method_id_name, const char* values)
{
    JNIEnv* senv = *env;
    jmethodID temp = senv->GetStaticMethodID(*s_class, method_id_name, values);

    if(temp == nullptr)
    {
        throw jni_nullptr_exc("jmethodID static nullptr exception", env);
    }

    return temp;
}
