import { storageApi } from './storage';

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (url.startsWith('/api/')) {
    console.log(`Mock Fetch: ${url}`, init);
    const path = url.replace('/api/', '');
    const method = init?.method || 'GET';
    const body = init?.body ? JSON.parse(init.body as string) : null;

    try {
      let data: any = null;

      // User routes
      if (path.startsWith('user/')) {
        const email = path.split('/')[1];
        if (method === 'GET') {
          if (path.includes('/packages')) data = await storageApi.getUserPackages(email);
          else if (path.includes('/transactions')) data = await storageApi.getUserTransactions(email);
          else if (path.includes('/calls')) data = await storageApi.getUserCalls(email);
          else data = await storageApi.getUser(email);
        } else if (method === 'POST') {
          if (path === 'user/recharge') data = await storageApi.rechargeWallet(body.email, body.amount);
          else if (path === 'user/register') data = await storageApi.registerUser(body);
        }
      }
      
      // Astrologer routes
      else if (path === 'astrologers') data = await storageApi.getAstrologers();
      else if (path.startsWith('astrologer/')) {
        if (path.includes('/reviews')) {
          const id = parseInt(path.split('/')[1]);
          data = await storageApi.getReviews(id);
        } else if (path === 'astrologer/register') data = await storageApi.registerAstrologer(body);
        else if (path === 'astrologer/login') data = await storageApi.loginAstrologer(body.email, body.password);
      }

      // Other routes
      else if (path === 'testimonials') data = await storageApi.getTestimonials();
      else if (path === 'categories') data = await storageApi.getCategories();
      else if (path === 'packages') data = await storageApi.getPackages();
      else if (path === 'products') data = await storageApi.getProducts('approved');
      else if (path === 'puja') data = await storageApi.getPuja();

      // Chat
      else if (path === 'chat/start') data = await storageApi.requestChat(body.email, body.astrologerId);
      else if (path.startsWith('chat/status/')) {
        const requestId = parseInt(path.split('/')[2]);
        const requests = JSON.parse(localStorage.getItem('astroway_db_chat_requests') || '[]');
        const req = requests.find((r: any) => r.id === requestId);
        if (req?.status === 'accepted') {
          data = { status: 'accepted', sessionId: requestId }; // Simplified
        } else {
          data = { status: req?.status || 'pending' };
        }
      }

      // Admin actions
      else if (path === 'admin/astrologer/approve') {
        const { astroId, action } = body;
        const astros = JSON.parse(localStorage.getItem('astroway_db_astrologers') || '[]');
        const index = astros.findIndex((a: any) => a.id === astroId);
        if (index !== -1) {
          astros[index].status = action;
          astros[index].is_active = action === 'approved';
          localStorage.setItem('astroway_db_astrologers', JSON.stringify(astros));
          data = { success: true };
        }
      }
      else if (path === 'admin/user/approve') {
        const { userId, action } = body;
        const users = JSON.parse(localStorage.getItem('astroway_db_users') || '[]');
        const index = users.findIndex((u: any) => u.id === userId);
        if (index !== -1) {
          users[index].status = action;
          users[index].is_active = action === 'approved';
          localStorage.setItem('astroway_db_users', JSON.stringify(users));
          data = { success: true };
        }
      }

      // Admin
      else if (path.startsWith('admin/')) {
        if (path === 'admin/pending-astrologers') data = await storageApi.getPendingAstrologers();
        else if (path === 'admin/pending-users') data = await storageApi.getPendingUsers();
        else if (path === 'admin/transactions') data = await storageApi.getTransactions();
        else if (path === 'admin/calls') data = await storageApi.getCalls();
        else if (path === 'admin/astrologers') data = await storageApi.getAstrologers(false);
        else if (path === 'admin/users') data = await storageApi.getUsers();
        else if (path === 'admin/vendors') data = await storageApi.getVendors();
        else if (path === 'admin/testimonials') data = await storageApi.getTestimonials();
      }

      if (data !== null) {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return originalFetch(input, init);
};
