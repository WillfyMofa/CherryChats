#include "NativeCherryLib.h"
#include "JniControl.hpp"
#include <boost/filesystem/fstream.hpp>
#include <exception>
#include <string>
#include <thread>

//namespace fs = boost::filesystem;
namespace fs = std::filesystem;

namespace facebook::react {

std::string get_uuid()
{
    boost::uuids::uuid some_uuid = boost::uuids::random_generator()();

    std::string return_value = boost::lexical_cast<std::string>(some_uuid);

    return return_value;
}

NativeCherryLib::NativeCherryLib(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeCherryLibCxxSpec(std::move(jsInvoker)) {}

std::string NativeCherryLib::getUuid(jsi::Runtime &rt)
{
    JNIEnv* fenv = 0;
    JavaVM* g_vm = vm_object::get_g_vm();
    jni_control jcontrol(g_vm);
    jstring absolute_path;

    g_vm = jcontrol.init_jnienv(&fenv);

    std::string st;
    std::string uuid_ff;
    std::string string_path;
    fs::path path_to_file;
    std::fstream fstr;

    if(g_vm == nullptr)
    {
        return "JavaVM is NULL";
    }

    try
    {
        //getting current activity thread
        jclass get_cl_activity = jcontrol.find_class(&fenv, "android/app/ActivityThread");
        jmethodID get_id_cactivity = jcontrol.get_static_method_id(&fenv, &get_cl_activity, "currentActivityThread",
            "()Landroid/app/ActivityThread;");
        jobject current_activity_object = jcontrol.call_static_object_method(&fenv, &get_cl_activity, &get_id_cactivity);

        //getting current application
        jmethodID get_id_application = jcontrol.get_method_id(&fenv, &get_cl_activity, "getApplication",
            "()Landroid/app/Application;");
        jobject object_get_application = jcontrol.call_object_method(&fenv, &current_activity_object, &get_id_application);

        //getting getFilesDir
        jclass get_cl_context = jcontrol.find_class(&fenv, "android/content/Context");
        jmethodID get_id_getfilesdir = jcontrol.get_method_id(&fenv, &get_cl_context, "getFilesDir", "()Ljava/io/File;");
        jobject obj_files_dir = jcontrol.call_object_method(&fenv, &object_get_application, &get_id_getfilesdir);

        //getting string from file
        jclass get_cl_file = jcontrol.find_class(&fenv, "java/io/File");
        jmethodID get_id_getabsolutepath = jcontrol.get_method_id(&fenv, &get_cl_file, "getAbsolutePath",
            "()Ljava/lang/String;");
        absolute_path = (jstring) jcontrol.call_object_method(&fenv, &obj_files_dir, &get_id_getabsolutepath);
    }
    catch(jni_nullptr_exc &ex)
    {
        jcontrol.uninit_jnienv();
        return ex.what();
    }

    if(absolute_path == nullptr)
    {
        return "I hate warnings to errors...";
    }

    try
    {
        string_path = fenv->GetStringUTFChars(absolute_path, nullptr);
    }
    catch (std::exception ex)
    {
        jcontrol.uninit_jnienv();

        return "ERROR";
    }

    string_path.append("cherry_uuid.txt");

    path_to_file = string_path;
    fstr.exceptions(std::fstream::badbit | std::fstream::failbit);

    if(fs::exists(path_to_file))
    {
        try
        {
            fstr.open(path_to_file, std::fstream::in);
            if(!fstr.is_open())
            {
                return "Error of opening file.";
            }
            else
            {
                while(!fstr.eof())
                {
                    st = "";
                    getline(fstr, st);

                    uuid_ff = st;
                }
            }

            fstr.close();
            fstr.clear();
        }
        catch(const std::fstream::failure &ex)
        {
            std::string fstream_error = ex.what();

            return fstream_error;
        }
    }
    else
    {
        try
        {
            fstr.open(path_to_file, std::fstream::out);
            if(!fstr.is_open())
            {
                return "Error of opening file.";
            }
            else
            {
                fstr << get_uuid();
            }
            fstr.close();
            fstr.clear();

            fstr.open(path_to_file, std::fstream::in);
            if(!fstr.is_open())
            {
                return "Error of opening file.";
            }
            else
            {
                while(!fstr.eof())
                {
                    st = "";
                    getline(fstr, st);

                    uuid_ff = st;
                }
            }

            fstr.close();
            fstr.clear();
        }
        catch(const std::fstream::failure &ex)
        {
            std::string fstream_error = ex.what();

            return fstream_error;
        }
    }

    bool check = jcontrol.uninit_jnienv();

    if(check)
    {
        return "JNI is not OK";
    }

    return uuid_ff;
}

} // namespace facebook::react
