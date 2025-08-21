/**
 * @fileoverview Custom hook for highlight.js management
 * @author Axel Modra
 */

import hljs from 'highlight.js/lib/core';
import apache from 'highlight.js/lib/languages/apache';
// Shell and config
import bash from 'highlight.js/lib/languages/bash';
import clojure from 'highlight.js/lib/languages/clojure';
import cmake from 'highlight.js/lib/languages/cmake';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
import delphi from 'highlight.js/lib/languages/delphi';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import elixir from 'highlight.js/lib/languages/elixir';
import erlang from 'highlight.js/lib/languages/erlang';
import fortran from 'highlight.js/lib/languages/fortran';
import fsharp from 'highlight.js/lib/languages/fsharp';
import go from 'highlight.js/lib/languages/go';
import gradle from 'highlight.js/lib/languages/gradle';
import graphql from 'highlight.js/lib/languages/graphql';
import haskell from 'highlight.js/lib/languages/haskell';
import ini from 'highlight.js/lib/languages/ini';
import java from 'highlight.js/lib/languages/java';
// Import semua bahasa yang diperlukan
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import latex from 'highlight.js/lib/languages/latex';
import less from 'highlight.js/lib/languages/less';
import lisp from 'highlight.js/lib/languages/lisp';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import markdownLang from 'highlight.js/lib/languages/markdown';
import matlab from 'highlight.js/lib/languages/matlab';
import nginx from 'highlight.js/lib/languages/nginx';
import objectivec from 'highlight.js/lib/languages/objectivec';
import ocaml from 'highlight.js/lib/languages/ocaml';
import perl from 'highlight.js/lib/languages/perl';
import php from 'highlight.js/lib/languages/php';
import powershell from 'highlight.js/lib/languages/powershell';
import prolog from 'highlight.js/lib/languages/prolog';
import protobuf from 'highlight.js/lib/languages/protobuf';
import python from 'highlight.js/lib/languages/python';
import r from 'highlight.js/lib/languages/r';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import scala from 'highlight.js/lib/languages/scala';
import scheme from 'highlight.js/lib/languages/scheme';
import scss from 'highlight.js/lib/languages/scss';
// Database
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import verilog from 'highlight.js/lib/languages/verilog';
import vhdl from 'highlight.js/lib/languages/vhdl';
// Other languages
import vim from 'highlight.js/lib/languages/vim';
import x86asm from 'highlight.js/lib/languages/x86asm';
// Web technologies
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { useEffect } from 'react';
import type { Theme } from '../../../features/ThemeSelector';
import { getHighlightTheme } from '../utils/languageUtils';

/**
 * Register all languages with highlight.js
 * Called once when hook is first used
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

// Flag to ensure languages are only registered once
let languagesRegistered = false;

/**
 * Custom hook untuk mengelola highlight.js
 * @param isDarkMode - Whether in dark mode
 * @param theme - Theme configuration
 */
export const useHighlightJs = (isDarkMode: boolean, theme?: Theme) => {
  useEffect(() => {
    if (!languagesRegistered) {
      registerLanguages();
      languagesRegistered = true;
    }
  }, []);

  // Load theme CSS based on current theme
  useEffect(() => {
    const loadHighlightTheme = () => {
      const existingLinks = document.querySelectorAll('link[href*="highlight.js"]');
      for (const link of existingLinks) {
        link.remove();
      }

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
    isReady: languagesRegistered,
  };
};
