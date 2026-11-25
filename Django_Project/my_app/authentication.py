from rest_framework_simplejwt.authentication import JWTAuthentication


# class CookieJWTAuthentication(JWTAuthentication):
#     """Read the JWT from an HttpOnly cookie instead of the Authorization header."""

#     def authenticate(self, request):
#         raw_token = request.COOKIES.get('access_token')

#         if raw_token is None:
#             # No cookie: fall back to the normal "Bearer <token>" header
#             return super().authenticate(request)

#         validated_token = self.get_validated_token(raw_token)
#         return self.get_user(validated_token), validated_token




class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # 1. Try default Header check first
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
        else:
            # 2. Fallback to extracting from HttpOnly cookie
            raw_token = request.COOKIES.get('access') or request.COOKIES.get('access_token')

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token