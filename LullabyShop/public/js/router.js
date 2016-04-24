'use strict';

define(['backbone'], function (Backbone) {
    var Router = Backbone.Router.extend({
        view: null,
        routes: {
            'lullaby/main'                     : 'main',
            'lullaby/shop(/p=:page)(/c=:count)': 'shop',
            'lullaby/help'                     : 'help',
            'lullaby/chat'                     : 'chat',
            'lullaby/about'                    : 'aboutUs',
            'lullaby/login'                    : 'login',
            'lullaby/register'                 : 'register',
            'lullaby/profile'                  : 'profile',
            'lullaby/contacts'                 : 'contacts',
            'lullaby/checkout'                 : 'checkout',
            'lullaby/blog(/p=:page)(/c=:count)': 'blogList',
            'lullaby/blog/:id'                 : 'blogDetails',
            'lullaby/search/:word'             : 'search',
            'lullaby/category/:id'             : 'productsCategory',
            'lullaby/product/:id'              : 'productDetails',
            'lullaby/activate/choice'          : 'activationChoice',
            'lullaby/activate/mobile'          : 'activateByMobile',
            'lullaby/activate/mail/:secret'    : 'activateByMail',
            'lullaby/recovery'                 : 'recovery',
            'lullaby/recovery/choice'          : 'recoveryChoice',
            'lullaby/recovery/mobile'          : 'recoveryByMobile',
            'lullaby/recovery/password'        : 'setNewPassword',
            'lullaby/recovery/mail/:secret'    : 'recoveryByMail',

            'lullaby/admin'                    : 'admin',
            'lullaby/admin/chat'               : 'adminChat',
            'lullaby/admin/blog'               : 'adminBlog',
            'lullaby/admin/user'               : 'adminUser',
            'lullaby/admin/product'            : 'adminProduct',
            'lullaby/admin/category'           : 'adminCategory',
            'lullaby/admin/reminder'           : 'adminReminder',
            'lullaby/admin/newsletter'         : 'adminNewsletter',

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

        shop: function () {
            var self = this;

            if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {

                require(['views/home'], function (HomeView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }

                    self.view = new HomeView();
                    APP.homeView = self.view;
                });
            }
        },

        help: function () {
            var self = this;

            if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
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
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/aboutUs/aboutUs'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        login: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {

                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/login/login'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        register: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {

                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/registration/registration'], function (View) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new View();
                })
            }
        },

        profile: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (!APP.authorised) {

                Backbone.history.navigate('#lullaby/login', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/profile/profile'], function (UserProfileView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new UserProfileView();
                });
            }
        },

        contacts: function () {
            var self = this;

            if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
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
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/order/orderDetails'], function (OrderView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new OrderView();
                })
            }
        },

        blogList: function (page, count) {
            var self = this;

            if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/blog/blogList'], function (BlogView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new BlogView(page, count);
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

        search: function (word) {
            var self = this;

            if (!APP.homeView) {

                APP.nextView = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/shop', {trigger: true});
            } else {

                require(['views/product/productsSearch'], function (Search) {
                    if (self.homeView) {

                        self.homeView.undelegateEvents();
                    }
                    self.homeView = new Search(word);
                });
            }
        },

        productsCategory: function (categoryId) {
            var self = this;

            if (!APP.homeView) {

                APP.nextView = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/shop', {trigger: true});
            } else {
                require(['views/product/productsCategory'], function (View) {
                    if (self.homeView) {

                        self.homeView.undelegateEvents();
                    }
                    self.homeView = new View(categoryId);
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
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

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
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

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
            var self = this;
            APP.authorised = localStorage.getItem('loggedIn');

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

        recovery: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {

                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/recovery/useRecovery'], function (RecoveryView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new RecoveryView();
                });
            }
        },

        recoveryChoice: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {

                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/recovery/recoveryChoice'], function (RecoveryChoiceView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }

                    self.view = new RecoveryChoiceView();
                });
            }
        },

        recoveryByMobile: function () {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {

                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/recovery/recoveryByMobile'], function (RecoveryByMobileView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new RecoveryByMobileView();
                });
            }
        },

        recoveryByMail: function (secret) {
            APP.authorised = localStorage.getItem('loggedIn');
            var self = this;

            if (APP.authorised) {

                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else if (!APP.mainView) {

                APP.next = Backbone.history.fragment;
                Backbone.history.navigate('#lullaby/main', {trigger: true});
            } else {
                require(['views/recovery/recoveryByMail'], function (RecoveryByMailView) {
                    if (self.view) {

                        self.view.undelegateEvents();
                    }
                    self.view = new RecoveryByMailView(secret);
                });
            }
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
            APP.isAdmin    = localStorage.getItem('isAdmin');

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

    return Router;
});