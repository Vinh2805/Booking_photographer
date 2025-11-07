<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photographer Bookings - Momentia</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f4f6;
            border-radius: 50%;
            border-top-color: #ec4899;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .hover-lift:hover {
            transform: translateY(-2px);
            transition: all 0.2s ease;
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen">
    <div id="root" class="min-h-screen"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        // ImageWithFallback component
        function ImageWithFallback({ src, alt, className, fallbackSrc = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }) {
            const [imgSrc, setImgSrc] = useState(src);

            const handleError = () => {
                setImgSrc(fallbackSrc);
            };

            return React.createElement('img', {
                src: imgSrc,
                alt: alt,
                className: className,
                onError: handleError
            });
        }

        // Main PhotographerBookings component
        function PhotographerBookings() {
            const [selectedStatus, setSelectedStatus] = useState('all');
            const [searchQuery, setSearchQuery] = useState('');
            const [selectedBooking, setSelectedBooking] = useState(null);
            const [bookings, setBookings] = useState([]);
            const [statusCounts, setStatusCounts] = useState({});
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);

            // Fetch bookings from API
            const fetchBookings = async (status = selectedStatus, search = searchQuery) => {
                setLoading(true);
                setError(null);
                try {
                    const params = new URLSearchParams();
                    if (status !== 'all') params.append('status', status);
                    if (search) params.append('search', search);
                    
                    const response = await fetch(`/api/buoi-chup?${params}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        setBookings(result.data);
                        setStatusCounts(result.counts || {});
                    } else {
                        setError(result.message || 'Có lỗi xảy ra khi tải danh sách buổi chụp');
                    }
                } catch (error) {
                    console.error('Lỗi khi tải bookings:', error);
                    setError('Không thể kết nối đến server');
                } finally {
                    setLoading(false);
                }
            };

            // Fetch on component mount and when filters change
            useEffect(() => {
                fetchBookings();
            }, [selectedStatus, searchQuery]);

            // Status configuration
            const getStatusInfo = (status) => {
                const statusMap = {
                    pending_confirmation: {
                        label: "Chờ xác nhận",
                        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                        icon: "⚠️",
                        badgeColor: "bg-yellow-500"
                    },
                    pending_deposit: {
                        label: "Chờ đặt cọc",
                        color: "bg-orange-100 text-orange-800 border-orange-200",
                        icon: "💰",
                        badgeColor: "bg-orange-500"
                    },
                    upcoming: {
                        label: "Sắp diễn ra",
                        color: "bg-blue-100 text-blue-800 border-blue-200",
                        icon: "📅",
                        badgeColor: "bg-blue-500"
                    },
                    ongoing: {
                        label: "Đang diễn ra",
                        color: "bg-green-100 text-green-800 border-green-200",
                        icon: "📷",
                        badgeColor: "bg-green-500"
                    },
                    pending_payment: {
                        label: "Chờ thanh toán",
                        color: "bg-red-100 text-red-800 border-red-200",
                        icon: "💳",
                        badgeColor: "bg-red-500"
                    },
                    pending_processing: {
                        label: "Chờ xử lý ảnh",
                        color: "bg-purple-100 text-purple-800 border-purple-200",
                        icon: "🖼️",
                        badgeColor: "bg-purple-500"
                    },
                    processed: {
                        label: "Đã xử lý ảnh",
                        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
                        icon: "⭐",
                        badgeColor: "bg-indigo-500"
                    },
                    completed: {
                        label: "Đã hoàn thành",
                        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                        icon: "✅",
                        badgeColor: "bg-emerald-500"
                    },
                    cancelled: {
                        label: "Đã huỷ",
                        color: "bg-slate-100 text-slate-800 border-slate-200",
                        icon: "❌",
                        badgeColor: "bg-slate-500"
                    },
                };
                return statusMap[status] || { 
                    label: status, 
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    icon: "📋",
                    badgeColor: "bg-gray-500"
                };
            };

            // Filter options
            const filterOptions = [
                { id: "all", status: "all", label: "Tất cả buổi chụp", icon: "📷" },
                { id: "pending_confirmation", status: "pending_confirmation", label: "Chờ xác nhận", icon: "⚠️" },
                { id: "pending_deposit", status: "pending_deposit", label: "Chờ đặt cọc", icon: "💰" },
                { id: "upcoming", status: "upcoming", label: "Sắp diễn ra", icon: "📅" },
                { id: "ongoing", status: "ongoing", label: "Đang diễn ra", icon: "📷" },
                { id: "pending_payment", status: "pending_payment", label: "Chờ thanh toán", icon: "💳" },
                { id: "pending_processing", status: "pending_processing", label: "Chờ xử lý ảnh", icon: "🖼️" },
                { id: "processed", status: "processed", label: "Đã xử lý ảnh", icon: "⭐" },
                { id: "completed", status: "completed", label: "Đã hoàn thành", icon: "✅" },
                { id: "cancelled", status: "cancelled", label: "Đã huỷ", icon: "❌" },
            ];

            const selectedFilterOption = filterOptions.find(option => option.status === selectedStatus) || filterOptions[0];

            // Loading state
            if (loading && bookings.length === 0) {
                return React.createElement('div', { 
                    className: "p-4 flex justify-center items-center h-64" 
                }, [
                    React.createElement('div', { 
                        key: 'spinner',
                        className: "loading" 
                    }),
                    React.createElement('span', { 
                        key: 'text',
                        className: "ml-2 text-gray-600" 
                    }, "Đang tải danh sách buổi chụp...")
                ]);
            }

            if (error) {
                return React.createElement('div', { 
                    className: "p-4 text-center text-red-600" 
                }, [
                    React.createElement('div', { 
                        key: 'icon',
                        className: "text-2xl mb-2" 
                    }, "❌"),
                    React.createElement('p', { key: 'message' }, error),
                    React.createElement('button', { 
                        key: 'retry',
                        onClick: () => fetchBookings(),
                        className: "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    }, "Thử lại")
                ]);
            }

            // Booking detail view
            if (selectedBooking) {
                const statusInfo = getStatusInfo(selectedBooking.status);
                
                return React.createElement('div', { 
                    className: "p-4 bg-white min-h-screen" 
                }, [
                    // Header
                    React.createElement('div', { 
                        key: 'header',
                        className: "flex items-center gap-3 mb-6" 
                    }, [
                        React.createElement('button', {
                            key: 'back',
                            onClick: () => setSelectedBooking(null),
                            className: "p-2 hover:bg-gray-100 rounded"
                        }, "← Quay lại"),
                        React.createElement('div', { 
                            key: 'title',
                            className: "flex-1" 
                        }, [
                            React.createElement('h1', { 
                                key: 'main',
                                className: "text-xl font-bold" 
                            }, "Chi tiết buổi chụp"),
                            React.createElement('p', { 
                                key: 'id',
                                className: "text-gray-600" 
                            }, `Mã: ${selectedBooking.id}`)
                        ]),
                        React.createElement('span', { 
                            key: 'badge',
                            className: `px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}` 
                        }, `${statusInfo.icon} ${statusInfo.label}`)
                    ]),

                    // Customer Info
                    React.createElement('div', { 
                        key: 'customer',
                        className: "bg-white border rounded-lg p-4 mb-4" 
                    }, [
                        React.createElement('h3', { 
                            key: 'title',
                            className: "font-medium mb-3" 
                        }, "Thông tin khách hàng"),
                        React.createElement('div', { 
                            key: 'content',
                            className: "flex items-center gap-3" 
                        }, [
                            React.createElement(ImageWithFallback, {
                                key: 'avatar',
                                src: selectedBooking.customer.avatar,
                                alt: selectedBooking.customer.name,
                                className: "w-12 h-12 rounded-full object-cover border"
                            }),
                            React.createElement('div', { 
                                key: 'info',
                                className: "flex-1" 
                            }, [
                                React.createElement('p', { 
                                    key: 'name',
                                    className: "font-medium" 
                                }, selectedBooking.customer.name),
                                React.createElement('p', { 
                                    key: 'role',
                                    className: "text-sm text-gray-600" 
                                }, "Khách hàng")
                            ])
                        ])
                    ]),

                    // Booking Details
                    React.createElement('div', { 
                        key: 'details',
                        className: "bg-white border rounded-lg p-4" 
                    }, [
                        React.createElement('h3', { 
                            key: 'title',
                            className: "font-medium mb-3" 
                        }, "Thông tin buổi chụp"),
                        
                        React.createElement('h4', { 
                            key: 'booking-title',
                            className: "font-medium text-lg mb-2" 
                        }, selectedBooking.title),
                        
                        React.createElement('div', { 
                            key: 'grid',
                            className: "grid grid-cols-2 gap-4 mb-4" 
                        }, [
                            React.createElement('div', { key: 'type' }, [
                                React.createElement('p', { 
                                    key: 'label',
                                    className: "text-gray-600 text-sm" 
                                }, "Thể loại"),
                                React.createElement('p', { 
                                    key: 'value',
                                    className: "font-medium" 
                                }, selectedBooking.type)
                            ]),
                            React.createElement('div', { key: 'duration' }, [
                                React.createElement('p', { 
                                    key: 'label',
                                    className: "text-gray-600 text-sm" 
                                }, "Thời lượng"),
                                React.createElement('p', { 
                                    key: 'value',
                                    className: "font-medium" 
                                }, selectedBooking.duration)
                            ]),
                            React.createElement('div', { key: 'price' }, [
                                React.createElement('p', { 
                                    key: 'label',
                                    className: "text-gray-600 text-sm" 
                                }, "Giá trị"),
                                React.createElement('p', { 
                                    key: 'value',
                                    className: "font-medium text-pink-600" 
                                }, selectedBooking.price.toLocaleString('vi-VN') + ' VNĐ')
                            ])
                        ]),

                        React.createElement('div', { key: 'location' }, [
                            React.createElement('p', { 
                                key: 'label',
                                className: "text-gray-600 text-sm mb-1" 
                            }, "📍 Địa điểm"),
                            React.createElement('p', { 
                                key: 'value',
                                className: "font-medium" 
                            }, selectedBooking.location)
                        ]),

                        React.createElement('div', { 
                            key: 'datetime',
                            className: "grid grid-cols-2 gap-4 mt-3" 
                        }, [
                            React.createElement('div', { key: 'date' }, [
                                React.createElement('p', { 
                                    key: 'label',
                                    className: "text-gray-600 text-sm mb-1" 
                                }, "📅 Ngày"),
                                React.createElement('p', { 
                                    key: 'value',
                                    className: "font-medium" 
                                }, new Date(selectedBooking.date).toLocaleDateString('vi-VN'))
                            ]),
                            React.createElement('div', { key: 'time' }, [
                                React.createElement('p', { 
                                    key: 'label',
                                    className: "text-gray-600 text-sm mb-1" 
                                }, "🕒 Giờ"),
                                React.createElement('p', { 
                                    key: 'value',
                                    className: "font-medium" 
                                }, selectedBooking.time)
                            ])
                        ])
                    ])
                ]);
            }

            // Main list view
            return React.createElement('div', { className: "p-4" }, [
                // Header
                React.createElement('div', { 
                    key: 'page-header',
                    className: "mb-6" 
                }, [
                    React.createElement('h1', { 
                        key: 'title',
                        className: "text-2xl font-bold text-gray-800" 
                    }, "📷 Quản lý Buổi Chụp"),
                    React.createElement('p', { 
                        key: 'subtitle',
                        className: "text-gray-600" 
                    }, `Tổng cộng ${statusCounts.all || 0} buổi chụp`)
                ]),

                // Filters
                React.createElement('div', { 
                    key: 'filters',
                    className: "bg-white rounded-lg shadow p-4 mb-6" 
                }, [
                    React.createElement('div', { 
                        key: 'filter-grid',
                        className: "grid grid-cols-1 md:grid-cols-2 gap-4" 
                    }, [
                        // Search input
                        React.createElement('div', { key: 'search' }, [
                            React.createElement('label', { 
                                key: 'label',
                                className: "block text-sm font-medium text-gray-700 mb-2" 
                            }, "🔍 Tìm kiếm"),
                            React.createElement('input', {
                                key: 'input',
                                type: 'text',
                                placeholder: 'Tìm theo mã, địa điểm, loại chụp...',
                                value: searchQuery,
                                onChange: (e) => setSearchQuery(e.target.value),
                                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            })
                        ]),

                        // Status filter
                        React.createElement('div', { key: 'status' }, [
                            React.createElement('label', { 
                                key: 'label',
                                className: "block text-sm font-medium text-gray-700 mb-2" 
                            }, "📊 Trạng thái"),
                            React.createElement('select', {
                                key: 'select',
                                value: selectedStatus,
                                onChange: (e) => setSelectedStatus(e.target.value),
                                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            }, 
                                filterOptions.map(option => 
                                    React.createElement('option', {
                                        key: option.id,
                                        value: option.status
                                    }, `${option.icon} ${option.label} (${statusCounts[option.status] || 0})`)
                                )
                            )
                        ])
                    ])
                ]),

                // Stats Cards
                React.createElement('div', { 
                    key: 'stats',
                    className: "grid grid-cols-2 md:grid-cols-5 gap-4 mb-6" 
                },
                    filterOptions.slice(0, 5).map(option => {
                        const statusInfo = getStatusInfo(option.status);
                        return React.createElement('div', {
                            key: option.id,
                            className: `bg-white rounded-lg shadow p-4 text-center cursor-pointer hover-lift border-l-4 ${
                                selectedStatus === option.status ? 'ring-2 ring-pink-500' : ''
                            }`,
                            style: { borderLeftColor: statusInfo.badgeColor.replace('bg-', '') },
                            onClick: () => setSelectedStatus(option.status)
                        }, [
                            React.createElement('div', { 
                                key: 'icon',
                                className: "text-2xl mb-2" 
                            }, option.icon),
                            React.createElement('div', { 
                                key: 'count',
                                className: "text-xl font-bold" 
                            }, statusCounts[option.status] || 0),
                            React.createElement('div', { 
                                key: 'label',
                                className: "text-sm text-gray-600" 
                            }, option.label)
                        ]);
                    })
                ),

                // Bookings List
                React.createElement('div', { 
                    key: 'bookings-list',
                    className: "space-y-4" 
                }, 
                    bookings.length === 0 ? 
                        React.createElement('div', { 
                            key: 'empty',
                            className: "text-center py-12 text-gray-500" 
                        }, [
                            React.createElement('div', { 
                                key: 'icon',
                                className: "text-4xl mb-4" 
                            }, "📭"),
                            React.createElement('p', { 
                                key: 'message',
                                className: "text-lg" 
                            }, "Không có buổi chụp nào"),
                            React.createElement('p', { 
                                key: 'submessage',
                                className: "text-sm" 
                            }, "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm")
                        ]) :
                        bookings.map(booking => {
                            const statusInfo = getStatusInfo(booking.status);
                            return React.createElement('div', {
                                key: booking.id,
                                className: "bg-white rounded-lg shadow p-4 cursor-pointer hover-lift border-l-4",
                                style: { borderLeftColor: statusInfo.badgeColor.replace('bg-', '') },
                                onClick: () => setSelectedBooking(booking)
                            }, [
                                React.createElement('div', { 
                                    key: 'header',
                                    className: "flex items-start justify-between mb-3" 
                                }, [
                                    React.createElement('div', { key: 'info' }, [
                                        React.createElement('h3', { 
                                            key: 'title',
                                            className: "font-semibold text-lg" 
                                        }, booking.title),
                                        React.createElement('p', { 
                                            key: 'customer',
                                            className: "text-gray-600" 
                                        }, `👤 ${booking.customer.name}`)
                                    ]),
                                    React.createElement('span', { 
                                        key: 'badge',
                                        className: `px-2 py-1 rounded text-xs font-medium ${statusInfo.color}` 
                                    }, `${statusInfo.icon} ${statusInfo.label}`)
                                ]),

                                React.createElement('div', { 
                                    key: 'details',
                                    className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" 
                                }, [
                                    React.createElement('div', { key: 'date' }, [
                                        React.createElement('p', { 
                                            key: 'label',
                                            className: "text-gray-500" 
                                        }, "📅 Ngày"),
                                        React.createElement('p', { 
                                            key: 'value',
                                            className: "font-medium" 
                                        }, new Date(booking.date).toLocaleDateString('vi-VN'))
                                    ]),
                                    React.createElement('div', { key: 'time' }, [
                                        React.createElement('p', { 
                                            key: 'label',
                                            className: "text-gray-500" 
                                        }, "🕒 Giờ"),
                                        React.createElement('p', { 
                                            key: 'value',
                                            className: "font-medium" 
                                        }, booking.time)
                                    ]),
                                    React.createElement('div', { key: 'location' }, [
                                        React.createElement('p', { 
                                            key: 'label',
                                            className: "text-gray-500" 
                                        }, "📍 Địa điểm"),
                                        React.createElement('p', { 
                                            key: 'value',
                                            className: "font-medium truncate" 
                                        }, booking.location)
                                    ]),
                                    React.createElement('div', { key: 'price' }, [
                                        React.createElement('p', { 
                                            key: 'label',
                                            className: "text-gray-500" 
                                        }, "💰 Giá"),
                                        React.createElement('p', { 
                                            key: 'value',
                                            className: "font-medium text-pink-600" 
                                        }, booking.price.toLocaleString('vi-VN') + ' VNĐ')
                                    ])
                                ])
                            ]);
                        })
                )
            ]);
        }

        // Render the app
        ReactDOM.render(
            React.createElement(PhotographerBookings),
            document.getElementById('root')
        );
    </script>
</body>
</html>