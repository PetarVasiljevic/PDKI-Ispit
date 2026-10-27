import { UserService } from "@/services/user.service"
import { useRoute, useRouter } from "vue-router"

export function useLogin() {
    const router = useRouter()
    const route = useRoute()

    return () => {
        if (!UserService.getActiveUser()) {
            sessionStorage.setItem('to', route.fullPath)
            router.push('/login')
            return false
        }
        return true
    }
}
