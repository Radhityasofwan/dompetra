/**
 * DOMPETRA - AUTHENTICATION MODULE
 * Mengelola logic registrasi, sesi login via Supabase, dan UX loading aplikasi.
 */
(function(D) {
    // Pastikan namespace tersedia
    D.auth = D.auth || {};

    // Menerapkan Direct Assignment agar tidak terjadi bentrok atau reference error
    Object.assign(D.auth, {
        init: async () => {
          try {
            // Cek ketersediaan SDK Supabase
            if (!D.sb) {
                const appLoader = document.getElementById('app-loader');
                const authScreen = document.getElementById('auth-screen');
                
                if (appLoader) appLoader.classList.add('hidden');
                if (authScreen) authScreen.style.display = 'flex';
                
                if (D.utils && typeof D.utils.toast === 'function') {
                    D.utils.toast('Koneksi database terputus. Coba muat ulang.');
                }
                return;
            }

            // Memeriksa cache session lokal untuk login instan (Offline support)
            const cachedSession = localStorage.getItem('dompetra_session');
            
            if (cachedSession) {
                try {
                    const session = JSON.parse(cachedSession);
                    if (session && session.user) {
                        D.auth.showApp(session.user);
                    } else {
                        throw new Error('Invalid local cache format');
                    }
                } catch (e) {
                    console.warn('Cache rusak, fallback ke layar login');
                    const authScreen = document.getElementById('auth-screen');
                    const appLoader = document.getElementById('app-loader');
                    if (authScreen) authScreen.style.display = 'flex';
                    if (appLoader) appLoader.classList.add('hidden');
                }
            } else {
                 const authScreen = document.getElementById('auth-screen');
                 const appLoader = document.getElementById('app-loader');
                 if (authScreen) authScreen.style.display = 'flex';
                 if (appLoader) appLoader.classList.add('hidden');
            }

            // Real-time listener dari Supabase SDK
            D.sb.auth.onAuthStateChange((event, session) => {
              if (event === 'SIGNED_IN' && session) {
                D.auth.handleSession(session);
              } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('dompetra_session');
                localStorage.removeItem('dompetra_cache_data');
                window.location.reload();
              }
            });

            // Validasi keaslian session ke server (Background check)
            const { data, error } = await D.sb.auth.getSession();
            if (error) throw error;
            
            if (data && data.session) {
              D.auth.handleSession(data.session);
            } else if (cachedSession) {
               // Jika secara lokal ada cache tapi server bilang tidak valid (expired)
               localStorage.removeItem('dompetra_session');
               window.location.reload();
            }
          } catch (e) {
            console.error('Auth Init Error:', e);
            const authScreen = document.getElementById('auth-screen');
            const appLoader = document.getElementById('app-loader');
            if (authScreen) authScreen.style.display = 'flex';
            if (appLoader) appLoader.classList.add('hidden');
          }
        },

        handleSession: (session) => {
          if (!session || !session.user) return;
          
          // Simpan ulang session ke localStorage agar selalu update
          localStorage.setItem('dompetra_session', JSON.stringify(session));
          
          const authScreen = document.getElementById('auth-screen');
          if (authScreen && authScreen.style.display !== 'none') {
              D.auth.showApp(session.user);
          } else {
              if (!D.state) D.state = {};
              D.state.user = session.user;
          }
        },

        showApp: (user) => {
            if (!D.state) D.state = {};
            D.state.user = user;
            
            const screen = document.getElementById('auth-screen');
            const loader = document.getElementById('app-loader');
            
            // Animasi transisi layar keluar dari auth menuju aplikasi
            if (screen) {
                screen.style.opacity = '0';
                setTimeout(() => {
                    screen.style.display = 'none';
                }, 400); // Sinkron dengan transition ease di CSS
            }
            if (loader) {
                loader.classList.add('hidden');
            }
            
            const frame = document.querySelector('.app-frame');
            if (frame) {
                frame.classList.add('loaded');
            }
            
            // Memulai proses load data dari database secara berulang hingga modul data siap
            const startDataLoad = () => {
                if (D.data && typeof D.data.initLoad === 'function') {
                    D.data.initLoad();
                } else {
                    // Coba lagi setelah 200ms jika JS script D.data belum dieksekusi browser
                    setTimeout(startDataLoad, 200);
                }
            };
            
            startDataLoad();
        },

        login: async () => {
          const emailInp = document.getElementById('login-email');
          const passInp = document.getElementById('login-pass');
          const btn = document.getElementById('btn-login');

          const email = emailInp ? emailInp.value.trim() : '';
          const password = passInp ? passInp.value : '';

          if (!email || !password) {
              if (D.utils && typeof D.utils.toast === 'function') {
                  return D.utils.toast('Email dan Password wajib diisi.');
              }
              return;
          }

          // Visual UX: Status Loading saat memproses request
          if (btn) { 
              btn.disabled = true; 
              btn.style.opacity = '0.7';
              btn.style.cursor = 'not-allowed';
              btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="margin-right:8px;"></span>Memproses...'; 
          }
          
          try {
            if (!D.sb) throw new Error('Koneksi Supabase gagal terbentuk.');
            
            const { data, error } = await D.sb.auth.signInWithPassword({ 
                email: email, 
                password: password 
            });
            
            if (error) {
              // Terjemahkan error bahasa inggris ke bahasa indonesia agar ramah user
              if (error.message.includes('Invalid login credentials')) {
                 D.utils.toast('Email atau Password salah.');
              } else if (error.message.includes('Email not confirmed')) {
                 D.utils.toast('Email belum diverifikasi. Silakan cek Inbox/Spam email Anda.');
              } else {
                 D.utils.toast('Gagal login: Periksa koneksi internet Anda.');
              }
            } else if (data && data.session) {
              // Bersihkan input setelah sukses menghindari penyimpanan plain text di UI memory
              if (emailInp) emailInp.value = '';
              if (passInp) passInp.value = '';
              
              D.auth.handleSession(data.session);
            }
          } catch (e) {
            console.error('Login Exception:', e);
            if (D.utils && typeof D.utils.toast === 'function') {
                D.utils.toast('Terjadi kesalahan tidak terduga saat login.');
            }
          } finally {
            // Restore kondisi tombol jika proses terhenti/gagal, tapi tidak sedang load app
            const authScreen = document.getElementById('auth-screen');
            if (btn && authScreen && authScreen.style.display !== 'none') { 
                btn.disabled = false; 
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.innerHTML = 'Masuk Aplikasi'; 
            }
          }
        },

        reg: async () => {
          const nameInp = document.getElementById('reg-name');
          const waInp = document.getElementById('reg-wa');
          const emailInp = document.getElementById('reg-email');
          const passInp = document.getElementById('reg-pass');
          const btn = document.getElementById('btn-reg');

          const name = nameInp ? nameInp.value.trim() : '';
          const wa = waInp ? waInp.value.trim() : '';
          const email = emailInp ? emailInp.value.trim() : '';
          const password = passInp ? passInp.value : '';

          if (!name || !email || !password) {
              if (D.utils && typeof D.utils.toast === 'function') {
                  return D.utils.toast('Nama Lengkap, Email, dan Password wajib diisi.');
              }
              return;
          }

          // Visual UX: Status Loading pendaftaran
          if (btn) { 
              btn.disabled = true; 
              btn.style.opacity = '0.7';
              btn.style.cursor = 'not-allowed';
              btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="margin-right:8px;"></span>Mendaftarkan...'; 
          }

          try {
            if (!D.sb) throw new Error('Koneksi Supabase gagal terbentuk.');
            
            // Lakukan register dan simpan metadata dasar
            const { data, error } = await D.sb.auth.signUp({ 
                email: email, 
                password: password, 
                options: { 
                    data: { 
                        full_name: name, 
                        whatsapp_number: wa 
                    }, 
                    emailRedirectTo: window.location.origin 
                } 
            });
            
            if (error) {
              if (D.utils && typeof D.utils.toast === 'function') {
                  D.utils.toast(error.message || 'Gagal mendaftar akun baru.');
              }
            } else {
              // Sukses Mendaftar
              if (data && data.session) {
                 // Konfigurasi Supabase mengizinkan login otomatis tanpa verifikasi email
                 if (nameInp) nameInp.value = ''; 
                 if (emailInp) emailInp.value = ''; 
                 if (passInp) passInp.value = '';
                 
                 if (D.utils) D.utils.toast('Registrasi Berhasil! Selamat Datang.');
                 D.auth.handleSession(data.session);
                 
              } else if (data && data.user && !data.session) {
                 // Konfigurasi Supabase mewajibkan verifikasi email
                 if (D.utils) D.utils.toast('Sukses! Mohon cek kotak masuk email Anda untuk link konfirmasi.');
                 if (typeof window.toggleAuth === 'function') {
                     window.toggleAuth('login');
                 }
              }
            }
          } catch (e) {
            console.error('Registration Exception:', e);
            if (D.utils && typeof D.utils.toast === 'function') {
                D.utils.toast('Terjadi kesalahan tidak terduga saat pendaftaran.');
            }
          } finally {
            // Restore kondisi tombol
            if (btn) { 
                btn.disabled = false; 
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.innerHTML = 'Buat Akun Baru'; 
            }
          }
        },

        logout: async () => {
          // Visual feedback saat menekan logout
          if (D.utils && typeof D.utils.toast === 'function') {
              D.utils.toast('Menutup sesi...');
          }
            
          try { 
              if (D.sb) {
                  await D.sb.auth.signOut(); 
              }
          } catch (e) { 
              console.error('Logout error:', e); 
          } finally { 
              // Hapus bersih seluruh penyimpanan memori browser
              localStorage.removeItem('dompetra_session'); 
              localStorage.removeItem('dompetra_cache_data'); 
              
              // Reload untuk mengosongkan RAM dan memaksa load layar login baru
              setTimeout(() => {
                  window.location.reload(); 
              }, 500);
          }
        }
    });

})(window.Dompetra);