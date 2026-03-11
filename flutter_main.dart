import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

// IMPORTANT: Replace this with your actual App URL from the top of the chat
const String backendUrl = "https://ais-dev-7fk7z66wvfytrldqi6e2hj-190917044007.asia-east1.run.app";

void main() {
  runApp(const AstrowayApp());
}

class ApiService {
  static Future<List<dynamic>> fetchAstrologers() async {
    final response = await http.get(Uri.parse('$backendUrl/api/astrologers'));
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load astrologers');
  }

  static Future<List<dynamic>> fetchProducts() async {
    final response = await http.get(Uri.parse('$backendUrl/api/products?status=approved'));
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load products');
  }
}

class AstrowayApp extends StatelessWidget {
  const AstrowayApp({super.key});
// ... rest of the app code ...

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Astroway',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF6321), // Saffron
          primary: const Color(0xFFFF6321),
          secondary: const Color(0xFF1A1A2E), // Deep Blue
        ),
        scaffoldBackgroundColor: const Color(0xFFF8F8F8),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1A1A2E),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const AstrologersScreen(),
    const ShopScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFFFF6321),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.chat_outlined), activeIcon: Icon(Icons.chat), label: 'Consult'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_outlined), activeIcon: Icon(Icons.shopping_bag), label: 'Shop'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ASTROWAY', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.account_balance_wallet_outlined), onPressed: () {}),
          IconButton(icon: const Icon(Icons.notifications_none), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner
            Container(
              width: double.infinity,
              height: 180,
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: const LinearGradient(colors: [Color(0xFFFF6321), Color(0xFFF27D26)]),
              ),
              child: Stack(
                children: [
                  Positioned(
                    right: -20, bottom: -20,
                    child: Icon(Icons.wb_sunny, size: 150, color: Colors.white.withOpacity(0.2)),
                  ),
                  const Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Daily Horoscope', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                        Text('Check what stars have for you today', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        SizedBox(height: 16),
                        Material(
                          color: Colors.white,
                          borderRadius: BorderRadius.all(Radius.circular(12)),
                          child: Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Text('Check Now', style: TextStyle(color: Color(0xFFFF6321), fontWeight: FontWeight.bold)),
                          ),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Categories
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text('Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 100,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  _buildCategoryItem(Icons.auto_awesome, 'Kundli'),
                  _buildCategoryItem(Icons.favorite, 'Love'),
                  _buildCategoryItem(Icons.work, 'Career'),
                  _buildCategoryItem(Icons.home, 'Vastu'),
                  _buildCategoryItem(Icons.health_and_safety, 'Health'),
                ],
              ),
            ),

            // Featured Astrologers
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text('Top Astrologers', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
                  TextButton(onPressed: () {}, child: const Text('View All')),
                ],
              ),
            ),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 3,
              itemBuilder: (context, index) => _buildAstroCard(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryItem(IconData icon, String label) {
    return Container(
      width: 80,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.black12)),
            child: Icon(icon, color: const Color(0xFFFF6321)),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildAstroCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)),
      child: Row(
        children: [
          const CircleAvatar(radius: 30, backgroundImage: NetworkImage('https://picsum.photos/200')),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Acharya Sharma', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const Text('Vedic, Vastu • 12 yrs', style: TextStyle(color: Colors.grey, fontSize: 12)),
                Row(
                  children: List.generate(5, (i) => const Icon(Icons.star, color: Colors.amber, size: 14)),
                ),
              ],
            ),
          ),
          Column(
            children: [
              const Text('₹25/min', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFFF6321))),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A1A2E), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Chat'),
              )
            ],
          )
        ],
      ),
    );
  }
}

class AstrologersScreen extends StatelessWidget {
  const AstrologersScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Consult Astrologers')), body: const Center(child: Text('Astrologers List')));
}

class ShopScreen extends StatelessWidget {
  const ShopScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Astro Shop')), body: const Center(child: Text('Product Grid')));
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('My Profile')), body: const Center(child: Text('User Profile')));
}
