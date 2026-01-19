export const setTokens = (accessToken: string, refreshToken?: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const removeTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const parseJwt = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const getUserRoles = (): string[] => {
  const token = getAccessToken();
  if (!token) return [];
  
  const decoded = parseJwt(token);
  if (!decoded) return [];

  // Gom tất cả các khả năng tên key lại
  const rawRole = decoded.role || decoded.roles || decoded.authorities;

  // Nếu là mảng thì trả về nguyên mảng, nếu là chuỗi thì biến thành mảng
  if (Array.isArray(rawRole)) {
    return rawRole;
  } else if (typeof rawRole === 'string') {
    return [rawRole];
  }
  
  return [];
};

export const isAdmin = (): boolean => {
  const roles = getUserRoles();
  console.log("👮 Quyền hiện tại của User:", roles); // Log để check lần cuối
  
  // Chỉ cần CÓ chứa chữ ADMIN (hoặc ROLE_ADMIN) là cho qua
  return roles.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN');
};
