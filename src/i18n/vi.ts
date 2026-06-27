// Vietnamese strings for the parent/teacher surfaces (CLAUDE.md: parent surfaces
// are Vietnamese; child gameplay is English). Child content strings are not
// here — they're the English vocabulary itself. Grows as parent screens land
// (dashboard = task 24, placement = task 22).

export const vi = {
  parent: {
    // Login
    loginTitle: "Khu vực phụ huynh",
    loginSubtitle: "Đăng nhập để xem tiến độ và cài đặt.",
    email: "Email",
    password: "Mật khẩu",
    signIn: "Đăng nhập",
    signingIn: "Đang đăng nhập…",
    signOut: "Đăng xuất",
    signInError: "Email hoặc mật khẩu không đúng.",
    notConfigured: "Chưa kết nối máy chủ. Khu vực phụ huynh tạm thời không khả dụng.",
    backToKids: "Về phần của bé",

    // PIN gate
    pinSetupTitle: "Tạo mã PIN",
    pinSetupSubtitle: "Đặt mã 4 số để vào khu vực phụ huynh.",
    pinEnterTitle: "Nhập mã PIN",
    pinEnterSubtitle: "Nhập mã 4 số để tiếp tục.",
    pinConfirm: "Nhập lại mã PIN",
    pinMismatch: "Hai mã PIN không khớp.",
    pinWrong: "Mã PIN không đúng.",
    pinInvalid: "Mã PIN phải gồm 4 chữ số.",
    pinSave: "Lưu mã PIN",
    pinSubmit: "Xác nhận",

    // Landing
    homeTitle: "Khu vực phụ huynh",
    homeBlurb: "Bảng tiến độ và cài đặt sẽ xuất hiện ở đây.",

    // Dashboard (task 24)
    dashboard: {
      title: "Tiến độ học",
      empty: "Chưa có hồ sơ bé nào được liên kết với tài khoản này.",
      skills: { listen: "Nghe", speak: "Nói", read: "Đọc", write: "Viết" },
      accuracyLabel: "đúng ngay lần đầu",
      noPlay: "Chưa chơi",
      themesHeading: "Hòn đảo",
      hutsSuffix: "chòi hoàn thành", // "2/4 chòi hoàn thành"
      themeMastered: "Đã chinh phục",
      stickersHeading: "Nhãn dán đã sưu tầm",
    },
  },
} as const;

export type ParentStrings = typeof vi.parent;
