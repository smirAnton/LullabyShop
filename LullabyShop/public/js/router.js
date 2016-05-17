'use strict';

define(['backbone'], function (Backbone) {
    APP = APP || {};
    APP.navigate = function(url) {
        Backbone.history.navigate(url, {trigger: true});
    };

    return Backbone.Router.extend({
        view: null,
        routes: {
            'lullaby/main': 'main',
            'lullaby/shop(/p=:page)(/c=:count)': 'shop',
            'lullaby/help': 'help',
            'lullaby/chat': 'chat',
            'lullaby/about': 'aboutUs',
            'lullaby/register': 'register',
            'lullaby/profile': 'profile',
            'lullaby/contacts': 'contacts',
            'lullaby/checkout': 'checkout',
            'lullaby/blog(/p=:page)(/c=:count)': 'blogList',
            'lullaby/blog/:id': 'blogDetails',
            'lullaby/search/:word(/p=:page)(/c=:count)': 'search',
            'lullaby/categories/:query': 'filter',
            'lullaby/category/:id(/p=:page)(/c=:count)': 'productsCategory',
            'lullaby/product/:id': 'productDetails',
            'lullaby/activate/choice': 'activationChoice',
            'lullaby/activate/mobile': 'activateByMobile',
            'lullaby/activate/mail/:secret': 'activateByMail',

            'lullaby/recovery/:secret': 'recovery',

            'lullaby/admin': 'admin',
            'lullaby/admin/chat': 'adminChat',
            'lullaby/admin/blog': 'adminBlog',
            'lullaby/admin/user': 'adminUser',
            'lullaby/admin/product': 'adminProduct',
            'lullaby/admin/category': 'adminCategory',
            'lullaby/admin/reminder': 'adminReminder',
            'lullaby/admin/newsletter': 'adminNewsletter',

            '*any': 'default'
        },

        main: function () {
            if (APP.mainView) {

                Backbone.history.navigate('#lullaby/shop', {trigger: true});
            } else {
                require(['views/main'], function (MainView) {

                    APP.mainView = new MainView();
                });
            }
        },

        shop: function (page, count) {
            var self = this;
            var options;

            if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});

            } else {
                require(['views/home'], function (HomeView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    options = {
                        page: page,
                        count: count
                    };

                    self.view = new HomeView(options);
                    APP.homeView = self.view;
                });
            }
        },

        help: function () {
            var self = this;

            if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                APP.navigate('#lullaby/main');

            } else {
                require(['views/help/help'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        chat: function () {
            var self = this;

            if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/chat/chat'], function (ChatView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new ChatView();
                })
            }
        },

        aboutUs: function () {
            var self = this;

            if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                APP.navigate('#lullaby/main');

            } else {
                require(['views/aboutUs/aboutUs'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        register: function () {
            var self = this;

            if (APP.loggedIn) {
                APP.navigate('#lullaby/main');

            } else if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                APP.navigate('#lullaby/main');

            } else {
                require(['views/register/register'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        profile: function () {
            var self = this;

            if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                APP.navigate('#lullaby/main');

            } else {
                require(['views/profile/profile'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                });
            }
        },

        contacts: function () {
            var self = this;

            if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                APP.navigate('#lullaby/main');

            } else {
                require(['views/contacts/contacts'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        checkout: function () {
            var self = this;

            if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                APP.navigate('#lullaby/main');

            } else {
                require(['views/order/orderDetails'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        blogList: function (page, count) {
            var self = this;

            if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                APP.navigate('#lullaby/main');

            } else {
                require(['views/blog/blogList'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View(page, count);
                })
            }
        },

        blogDetails: function (blogId) {
            var self = this;

            if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/blog/blogDetails'], function (BlogDetailsView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new BlogDetailsView(blogId);
                })
            }
        },

        search: function (word, page, count) {
            var self = this;

            if (!APP.homeView) {

                APP.nextView = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/shop', {trigger: true});
            } else {
                require(['views/product/productsList'], function (View) {
                    var options = {
                        searchWord: word,
                        page      : page,
                        count     : count
                    };

                    if (self.homeView) {

                        self.homeView.undelegateEvents();
                    }
                    self.homeView = new View(options);
                });
            }
        },

        filter: function (filter) {
            var self = this;

            if (!APP.homeView) {

                APP.nextView = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/shop', {trigger: true});
            } else {
                require(['views/product/productsList'], function (View) {
                    var options = {
                        filter: filter
                    };

                    if (self.homeView) {

                        self.homeView.undelegateEvents();
                    }
                    self.homeView = new View(options);
                });
            }
        },

        productsCategory: function (categoryId, page, count) {
            var self = this;

            if (!APP.homeView) {

                APP.nextView = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/shop', {trigger: true});
            } else {
                require(['views/product/productsList'], function (View) {
                    var options;

                    if (self.homeView) {

                        self.homeView.undelegateEvents();
                    }

                    options = {
                        categoryId: categoryId,
                        count     : count,
                        page      : page
                    };


                    self.homeView = new View(options);
                });
            }
        },

        productDetails: function (productId) {
            var self = this;

            if (!APP.homeView) {

                APP.nextView = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/shop', {trigger: true});
            } else {
                require(['views/product/productDetails'], function (View) {
                    if (self.homeView) {

                        self.homeView.undelegateEvents();
                    }
                    self.homeView = new View(productId);
                });
            }
        },

        activationChoice: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {
                Backbone.history.navigate('#lullaby/main', {trigger: true});

            } else if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});

            } else {
                require(['views/activation/activationChoice'], function (ActivationChoiceView) {
                    if (self.view) {
                        self.view.undelegateEvents();
                    }
                    self.view = new ActivationChoiceView();
                });
            }
        },

        activateByMobile: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {
                Backbone.history.navigate('#lullaby/main', {trigger: true});

            } else if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});

            } else {
                require(['views/activation/activateByMobile'], function (ActivateByMobileView) {
                    if (self.view) {
                        self.view.undelegateEvents();
                    }
                    self.view = new ActivateByMobileView();
                })
            }
        },

        activateByMail: function (secret) {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {
                Backbone.history.navigate('#lullaby/main', {trigger: true});

            } else if (!APP.mainView) {
                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});

            } else {
                require(['views/activation/activateByMail'], function (activateByMailView) {
                    if (self.view) {
                        self.view.undelegateEvents();
                    }
                    self.view = new activateByMailView(secret);
                })
            }
        },

        recovery: function (secret) {
            var self = this;

            require(['views/auth/recovery'], function (View) {
                if (self.view) {

                    self.view.undelegateEvents();
                }
                self.view = new View(secret);
            });
        },

        setNewPassword: function (secret) {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {

                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/recovery/setNewPassword'], function (SetNewPasswordView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new SetNewPasswordView(secret);
                });
            }
        },

        admin: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            APP.isAdmin = localStorage.getItem('isAdmin');

            if (APP.mainView) {

                APP.mainView.undelegateEvents();
                delete APP.mainView;
            }

            if (APP.isAdmin) {
                if (APP.mainAdminView) {

                    Backbone.history.navigate('#lullaby/admin/category', {trigger: true});
                } else {
                    require(['views/admin/main'], function (MainAdminView) {

                        APP.mainAdminView = new MainAdminView();
                    });
                }
            } else {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            }
        },

        adminUser: function () {
            if (!APP.mainAdminView) {
                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/admin', {trigger: true});
            } else {
                require(['views/admin/user/user'], function (AdminUserView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new AdminUserView();
                });
            }
        },

        adminProduct: function () {
            var self = this;

            APP.authorised = localStorage.getItem('loggedIn');

            if (!APP.authorised) {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            } else if (!APP.mainAdminView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/admin', {trigger: true});
            } else {
                require(['views/admin/product/product'], function (AdminProductView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new AdminProductView();
                });
            }
        },

        adminCategory: function () {
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

            if (!APP.authorised) {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            } else if (!APP.mainAdminView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/admin', {trigger: true});
            } else {

                require(['views/admin/category/category'], function (AdminCategoryView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new AdminCategoryView();
                });
            }
        },

        adminChat: function () {
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

            if (!APP.authorised) {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            } else if (!APP.mainAdminView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/admin', {trigger: true});
            } else {

                require(['views/admin/chat/chat'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                });
            }
        },

        adminBlog: function () {
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

            if (!APP.authorised) {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            } else if (!APP.mainAdminView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/admin', {trigger: true});
            } else {

                require(['views/admin/blog/blog'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                });
            }
        },

        adminReminder: function () {
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

            if (!APP.authorised) {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            } else if (!APP.mainAdminView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/admin', {trigger: true});
            } else {

                require(['views/admin/reminder/reminder'], function (AdminReminderView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new AdminReminderView();
                });
            }
        },

        adminNewsletter: function () {
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

            if (!APP.authorised) {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            } else if (!APP.mainAdminView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/admin', {trigger: true});
            } else {

                require(['views/admin/newsletter/newsletter'], function (AdminNewsletterView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new AdminNewsletterView();
                });
            }
        },

        default: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            Backbone.history.navigate('#lullaby/main', {trigger: true});
        }
    });
});