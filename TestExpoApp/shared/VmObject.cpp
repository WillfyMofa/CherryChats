#include "NativeCherryLib.hpp"

namespace facebook::react {

JavaVM* vm_object::_g_vm = nullptr;

JavaVM* vm_object::get_g_vm()
{
    return _g_vm;
}

void vm_object::set_g_vm(JavaVM* vm)
{
    _g_vm = vm;
}

}
