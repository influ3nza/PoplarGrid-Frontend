import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, LoginRequest, LoginResponse, Team } from "@/types";
import { authApi } from "@/api/auth";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user_detail = ref<User | null>(null);
    const token = ref<string | null>(localStorage.getItem("token"));
    const userTeams = ref<Team[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const isAuthenticated = ref<boolean>(false);
    const isAdmin = computed(() => user_detail.value?.isAdmin || false);

    const login = async (credentials: LoginRequest) => {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await authApi.login(credentials);

        if (response.token && response.user) {
          token.value = response.token;
          user_detail.value = response.user;
          userTeams.value = response.teams || [];
          // localStorage.setItem('token', response.token)
          // localStorage.setItem('user', JSON.stringify(response.user))
          // localStorage.setItem('userTeams', JSON.stringify(response.teams || []))
          isAuthenticated.value = true;
          return true;
        }
        return false;
      } catch (err: any) {
        error.value = err.message || "登录失败";
        return false;
      } finally {
        isLoading.value = false;
      }
    };

    const logout = () => {
      user_detail.value = null;
      token.value = null;
      userTeams.value = [];
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      // localStorage.removeItem("userTeams");
      isAuthenticated.value = false;
    };

    const initAuth = () => {
      // const savedToken = localStorage.getItem("token");
      // const savedUser = localStorage.getItem("user");
      // const savedTeams = localStorage.getItem("userTeams");
      console.log(user_detail.value, token.value, userTeams.value);

      isAuthenticated.value = !!user_detail.value && !!token.value;
    };

    const updateUser = (updatedUser: User) => {
      user_detail.value = updatedUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return {
      user_detail,
      token,
      userTeams,
      isAuthenticated,
      isAdmin,
      isLoading,
      error,
      login,
      logout,
      initAuth,
      updateUser,
    };
  },
  {
    persist: {
      storage: sessionStorage,
    },
  }
);
