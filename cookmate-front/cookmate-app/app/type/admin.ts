export interface DashboardDto {
  totalUsers: number;
  totalRecipes: number;
  pendingReports: number;
  unansweredInquiries: number;
  todayVisitors: number;
  todayLikes: number;
  todayComments: number;
  monthlyBannedUsers: number;
  recentReports: ReportDto[];
  topRecipes: RecipeDto[];
  unansweredInquiryList: InquiryDto[];
  notice: string;
}

export interface ReportDto {
  reportId: number;
  reportType: string;
  targetId: string;
  reporterId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface RecipeDto {
  recipeId: number;
  title: string;
  author: string;
  likeCount: number;
  viewCount: number;
  category: string;
}

export interface InquiryDto {
  inquiryId: number;
  userId: string;
  title: string;
  status: string;
  createdAt: string;
  answer?: string;
  answerDate?: string;
}

export interface UserPageDto {
  userId: number;
  nickname: string;
  email: string;
  role: string;
  recipeCount: number;
  enrollDate: string;
  status: string;
}

export interface NoticeDto {
  noticeId: number;
  title: string;
  adminId: string;
  status: string;
  createdAt: string;
}

export interface PageResponse<T> {
  list: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface UserSearchDto {
  keyword?: string;
  status?: string;
  role?: string;
  orderBy?: string;
  page?: number;
  size?: number;
}

export interface ReportSearchDto {
  keyword?: string;
  reportType?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface RecipeSearchDto {
  keyword?: string;
  category?: string;
  orderBy?: string;
  page?: number;
  size?: number;
}

export interface NoticeSearchDto {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface InquirySearchDto {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}
