import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Gothic Dark Colors
  static const Color voidBlack = Color(0xFF080808);
  static const Color starkWhite = Color(0xFFF2F2F2);
  static const Color ghostWhite = Color(0xFFE6E6E6);
  static const Color silverMist = Color(0xFFCCCCCC);
  static const Color charcoalGray = Color(0xFF1A1A1A);
  static const Color obsidianGray = Color(0xFF0D0D0D);
  static const Color crimsonRed = Color(0xFFDC2626);
  static const Color bloodRed = Color(0xFF991B1B);
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: voidBlack,
      
      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: starkWhite,
        secondary: silverMist,
        surface: charcoalGray,
        background: voidBlack,
        error: crimsonRed,
        onPrimary: voidBlack,
        onSecondary: voidBlack,
        onSurface: starkWhite,
        onBackground: starkWhite,
        onError: starkWhite,
      ),
      
      // Typography
      textTheme: TextTheme(
        displayLarge: GoogleFonts.cinzel(
          fontSize: 32,
          fontWeight: FontWeight.w600,
          color: starkWhite,
          letterSpacing: 1.5,
        ),
        displayMedium: GoogleFonts.cinzel(
          fontSize: 24,
          fontWeight: FontWeight.w500,
          color: starkWhite,
        ),
        displaySmall: GoogleFonts.cinzel(
          fontSize: 20,
          fontWeight: FontWeight.w500,
          color: starkWhite,
        ),
        headlineMedium: GoogleFonts.cormorantGaramond(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: starkWhite,
        ),
        titleLarge: GoogleFonts.cormorantGaramond(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: starkWhite,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: ghostWhite,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: silverMist,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: starkWhite,
          letterSpacing: 1.2,
        ),
      ),
      
      // App Bar
      appBarTheme: AppBarTheme(
        backgroundColor: voidBlack,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.cinzel(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: starkWhite,
          letterSpacing: 1.5,
        ),
      ),
      
      // Card
      cardTheme: CardTheme(
        color: charcoalGray,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(0),
          side: BorderSide(color: starkWhite.withOpacity(0.1)),
        ),
      ),
      
      // Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: starkWhite,
          foregroundColor: voidBlack,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          textStyle: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
        ),
      ),
      
      // Input
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: charcoalGray,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: starkWhite.withOpacity(0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: starkWhite.withOpacity(0.2)),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: starkWhite),
        ),
      ),
      
      // Bottom Navigation
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: voidBlack,
        selectedItemColor: starkWhite,
        unselectedItemColor: silverMist,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}

