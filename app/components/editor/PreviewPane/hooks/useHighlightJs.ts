/**
 * @fileoverview Custom hook untuk highlight.js management
 * @author Senior Developer
 * @version 1.0.0
 */

import { useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import { getHighlightTheme } from '../utils/languageUtils';
import { Theme } from '../../../features/ThemeSelector';

// Import semua bahasa yang diperlukan
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import scala from 'highlight.js/lib/languages/scala';
import dart from 'highlight.js/lib/languages/dart';
import r from 'highlight.js/lib/languages/r';
import matlab from 'highlight.js/lib/languages/matlab';
import lua from 'highlight.js/lib/languages/lua';
import perl from 'highlight.js/lib/languages/perl';
import haskell from 'highlight.js/lib/languages/haskell';
import clojure from 'highlight.js/lib/languages/clojure';
import elixir from 'highlight.js/lib/languages/elixir';
import erlang from 'highlight.js/lib/languages/erlang';
import fsharp from 'highlight.js/lib/languages/fsharp';
import ocaml from 'highlight.js/lib/languages/ocaml';
import scheme from 'highlight.js/lib/languages/scheme';
import lisp from 'highlight.js/lib/languages/lisp';

// Web technologies
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import less from 'highlight.js/lib/languages/less';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdownLang from 'highlight.js/lib/languages/markdown';

// Shell and config
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import nginx from 'highlight.js/lib/languages/nginx';
import apache from 'highlight.js/lib/languages/apache';
import ini from 'highlight.js/lib/languages/ini';

// Database
import sql from 'highlight.js/lib/languages/sql';

// Other languages
import vim from 'highlight.js/lib/languages/vim';
import makefile from 'highlight.js/lib/languages/makefile';
import cmake from 'highlight.js/lib/languages/cmake';
import gradle from 'highlight.js/lib/languages/gradle';
import latex from 'highlight.js/lib/languages/latex';
import protobuf from 'highlight.js/lib/languages/protobuf';
import graphql from 'highlight.js/lib/languages/graphql';
import objectivec from 'highlight.js/lib/languages/objectivec';
import x86asm from 'highlight.js/lib/languages/x86asm';
import verilog from 'highlight.js/lib/languages/verilog';
import vhdl from 'highlight.js/lib/languages/vhdl';
import fortran from 'highlight.js/lib/languages/fortran';
import delphi from 'highlight.js/lib/languages/delphi';
import prolog from 'highlight.js/lib/languages/prolog';

/**
 * Register semua bahasa dengan highlight.js
 * Dipanggil sekali saat hook pertama kali digunakan
 */
const registerLanguages = () => {
  // Programming languages
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('js', javascript);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('ts', typescript);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('py', python);
  hljs.registerLanguage('java', java);
  hljs.registerLanguage('cpp', cpp);
  hljs.registerLanguage('c++', cpp);
  hljs.registerLanguage('c', cpp);
  hljs.registerLanguage('csharp', csharp);
  hljs.registerLanguage('cs', csharp);
  hljs.registerLanguage('c#', csharp);
  hljs.registerLanguage('php', php);
  hljs.registerLanguage('ruby', ruby);
  hljs.registerLanguage('rb', ruby);
  hljs.registerLanguage('go', go);
  hljs.registerLanguage('golang', go);
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('rs', rust);
  hljs.registerLanguage('swift', swift);
  hljs.registerLanguage('kotlin', kotlin);
  hljs.registerLanguage('kt', kotlin);
  hljs.registerLanguage('scala', scala);
  hljs.registerLanguage('dart', dart);
  hljs.registerLanguage('r', r);
  hljs.registerLanguage('matlab', matlab);
  hljs.registerLanguage('lua', lua);
  hljs.registerLanguage('perl', perl);
  hljs.registerLanguage('pl', perl);
  hljs.registerLanguage('haskell', haskell);
  hljs.registerLanguage('hs', haskell);
  hljs.registerLanguage('clojure', clojure);
  hljs.registerLanguage('clj', clojure);
  hljs.registerLanguage('elixir', elixir);
  hljs.registerLanguage('ex', elixir);
  hljs.registerLanguage('erlang', erlang);
  hljs.registerLanguage('erl', erlang);
  hljs.registerLanguage('fsharp', fsharp);
  hljs.registerLanguage('fs', fsharp);
  hljs.registerLanguage('f#', fsharp);
  hljs.registerLanguage('ocaml', ocaml);
  hljs.registerLanguage('ml', ocaml);
  hljs.registerLanguage('scheme', scheme);
  hljs.registerLanguage('scm', scheme);
  hljs.registerLanguage('lisp', lisp);

  // Web technologies
  hljs.registerLanguage('html', xml);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('scss', scss);
  hljs.registerLanguage('sass', scss);
  hljs.registerLanguage('less', less);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('yaml', yaml);
  hljs.registerLanguage('yml', yaml);
  hljs.registerLanguage('markdown', markdownLang);
  hljs.registerLanguage('md', markdownLang);

  // Shell and config
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('sh', bash);
  hljs.registerLanguage('shell', bash);
  hljs.registerLanguage('zsh', bash);
  hljs.registerLanguage('powershell', powershell);
  hljs.registerLanguage('ps1', powershell);
  hljs.registerLanguage('dockerfile', dockerfile);
  hljs.registerLanguage('docker', dockerfile);
  hljs.registerLanguage('nginx', nginx);
  hljs.registerLanguage('apache', apache);
  hljs.registerLanguage('ini', ini);
  hljs.registerLanguage('toml', ini);
  hljs.registerLanguage('conf', ini);
  hljs.registerLanguage('config', ini);

  // Database
  hljs.registerLanguage('sql', sql);
  hljs.registerLanguage('mysql', sql);
  hljs.registerLanguage('postgresql', sql);
  hljs.registerLanguage('sqlite', sql);
  hljs.registerLanguage('mongodb', javascript);
  hljs.registerLanguage('mongo', javascript);

  // Other languages
  hljs.registerLanguage('vim', vim);
  hljs.registerLanguage('makefile', makefile);
  hljs.registerLanguage('make', makefile);
  hljs.registerLanguage('cmake', cmake);
  hljs.registerLanguage('gradle', gradle);
  hljs.registerLanguage('latex', latex);
  hljs.registerLanguage('tex', latex);
  hljs.registerLanguage('protobuf', protobuf);
  hljs.registerLanguage('proto', protobuf);
  hljs.registerLanguage('graphql', graphql);
  hljs.registerLanguage('gql', graphql);
  hljs.registerLanguage('objectivec', objectivec);
  hljs.registerLanguage('objc', objectivec);
  hljs.registerLanguage('x86asm', x86asm);
  hljs.registerLanguage('assembly', x86asm);
  hljs.registerLanguage('asm', x86asm);
  hljs.registerLanguage('verilog', verilog);
  hljs.registerLanguage('v', verilog);
  hljs.registerLanguage('vhdl', vhdl);
  hljs.registerLanguage('fortran', fortran);
  hljs.registerLanguage('f90', fortran);
  hljs.registerLanguage('f95', fortran);
  hljs.registerLanguage('pascal', delphi);
  hljs.registerLanguage('delphi', delphi);
  hljs.registerLanguage('prolog', prolog);

  // Framework aliases
  hljs.registerLanguage('svelte', javascript);
  hljs.registerLanguage('vue', xml);
  hljs.registerLanguage('angular', typescript);
  hljs.registerLanguage('react', javascript);
  hljs.registerLanguage('jsx', javascript);
  hljs.registerLanguage('tsx', typescript);
  hljs.registerLanguage('node', javascript);
  hljs.registerLanguage('nodejs', javascript);
  hljs.registerLanguage('nextjs', javascript);
  hljs.registerLanguage('express', javascript);
  hljs.registerLanguage('fastapi', python);
  hljs.registerLanguage('django', python);
  hljs.registerLanguage('flask', python);
  hljs.registerLanguage('spring', java);
  hljs.registerLanguage('laravel', php);
  hljs.registerLanguage('rails', ruby);
  hljs.registerLanguage('gin', go);
  hljs.registerLanguage('actix', rust);
  hljs.registerLanguage('rocket', rust);
  hljs.registerLanguage('flutter', dart);

  // Configure highlight.js
  hljs.configure({
    ignoreUnescapedHTML: true,
    throwUnescapedHTML: false,
  });
};

// Flag untuk memastikan languages hanya di-register sekali
let languagesRegistered = false;

/**
 * Custom hook untuk mengelola highlight.js
 * @param isDarkMode - Apakah dalam dark mode
 * @param theme - Theme configuration
 */
export const useHighlightJs = (isDarkMode: boolean, theme?: Theme) => {
  // Register languages sekali saja
  useEffect(() => {
    if (!languagesRegistered) {
      registerLanguages();
      languagesRegistered = true;
    }
  }, []);

  // Load theme CSS berdasarkan current theme
  useEffect(() => {
    const loadHighlightTheme = () => {
      // Remove existing highlight.js stylesheets
      const existingLinks = document.querySelectorAll('link[href*="highlight.js"]');
      existingLinks.forEach(link => link.remove());

      // Get theme configuration
      const themeConfig = getHighlightTheme(isDarkMode, theme?.id);

      // Create new link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = themeConfig.url;
      
      document.head.appendChild(link);
    };

    loadHighlightTheme();
  }, [isDarkMode, theme?.id]);

  return {
    isReady: languagesRegistered
  };
};
