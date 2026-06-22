#ifndef _NATIVE_CHERRY_LIB_H
#define _NATIVE_CHERRY_LIB_H

#include <NativeCherrySpecsJSI.h>

#include <boost/uuid/random_generator.hpp>
#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_io.hpp>
#include <boost/lexical_cast.hpp>
//#include <boost/filesystem.hpp>
//#include <boost/filesystem/fstream.hpp>

#include <jni.h>

#include "JniControl.hpp"

#include <memory>
#include <string>
#include <fstream>
#include <filesystem>

namespace facebook::react {

class vm_object {
public:
    static void set_g_vm(JavaVM* vm);
    static JavaVM* get_g_vm();
private:
    static JavaVM* _g_vm;
};


class NativeCherryLib : public NativeCherryLibCxxSpec<NativeCherryLib> {
public:
  NativeCherryLib(std::shared_ptr<CallInvoker> jsInvoker);

  std::string getUuid(jsi::Runtime &rt);
};

} // namespace facebook::react


#endif //_NATIVE_CHERRY_LIB_H
