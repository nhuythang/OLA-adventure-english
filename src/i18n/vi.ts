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

    // Placement (task 22) — parent picks the best-fit can-do per skill; it maps
    // to starter/mover/flyer and is adjustable any time.
    placement: {
      title: "Xếp cấp độ",
      intro: "Chọn mức phù hợp nhất với bé cho từng kỹ năng. Có thể chỉnh lại bất cứ lúc nào.",
      save: "Lưu cấp độ",
      back: "Quay lại bảng tiến độ",
      editLink: "Chỉnh cấp độ",
      skills: {
        listen: {
          question: "Khi NGHE tiếng Anh, bé có thể…",
          options: [
            { level: "starter", label: "Nghe một từ và chỉ đúng tranh" },
            { level: "mover", label: "Nghe một từ, chọn trong nhiều tranh" },
            { level: "flyer", label: "Nghe cả câu và chọn đúng cảnh" },
          ],
        },
        speak: {
          question: "Khi NÓI tiếng Anh, bé có thể…",
          options: [
            { level: "starter", label: "Nghe mẫu rồi nhắc lại một từ" },
            { level: "mover", label: "Tự nói được từng từ" },
            { level: "flyer", label: "Trả lời câu hỏi bằng một cụm từ" },
          ],
        },
        read: {
          question: "Khi ĐỌC tiếng Anh, bé có thể…",
          options: [
            { level: "starter", label: "Ghép từ đã in với tranh" },
            { level: "mover", label: "Đọc một từ mà không cần nghe" },
            { level: "flyer", label: "Đọc một câu và hiểu nghĩa" },
          ],
        },
        write: {
          question: "Khi VIẾT tiếng Anh, bé có thể…",
          options: [
            { level: "starter", label: "Tô theo nét chữ cái" },
            { level: "mover", label: "Ghép chữ cái thành từ" },
            { level: "flyer", label: "Xếp các từ thành câu" },
          ],
        },
      },
    },

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
      // Grammar section (G6)
      grammarHeading: "Ngữ pháp",
      grammarStructures: {
        plurals: "Số nhiều (-s)",
        "present-continuous": "Thì hiện tại tiếp diễn",
        prepositions: "Giới từ chỉ vị trí",
      } as Record<string, string>,
      mostMissedHeading: "Cần luyện thêm",
      missesSuffix: "lần sai", // "3 lần sai"
      noMisses: "Chưa có lỗi nào được ghi nhận.",
    },
  },
} as const;

export type ParentStrings = typeof vi.parent;
