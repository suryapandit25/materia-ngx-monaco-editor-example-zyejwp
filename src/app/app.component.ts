import { Component, ViewChild } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import {
  MonacoEditorComponent,
  MonacoEditorConstructionOptions,
  MonacoEditorLoaderService,
  MonacoStandaloneCodeEditor
} from '@materia-ui/ngx-monaco-editor';
import { FormBuilder, FormGroup } from '@angular/forms';
import { location } from './json-examples';

@Component({
  selector: 'my-app',
  templateUrl: `./app.component.html`,
  styleUrls: [`./app.component.scss`]
})
export class AppComponent {
  @ViewChild(MonacoEditorComponent, { static: false })
  monacoComponent: MonacoEditorComponent;
  editorOptions: MonacoEditorConstructionOptions = {
    theme: 'myCustomTheme',
    language: 'html',
    roundedSelection: true,
    autoIndent: 'full'
  };
  code = this.getCode();
  reactiveForm: FormGroup;
  modelUri: monaco.Uri;

  constructor(
    private monacoLoaderService: MonacoEditorLoaderService,
    private fb: FormBuilder
  ) {
    this.reactiveForm = this.fb.group({
      code: [location]
    });
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => !!isLoaded),
        take(1)
      )
      .subscribe(() => {
        this.registerMonacoJsonSchemaValidator();
        this.registerMonacoCustomTheme();
      });
  }

  mergeOptions(partialOptions) {
    return {
      ...this.editorOptions,
      ...partialOptions
    };
  }

  editorInit(editor: MonacoStandaloneCodeEditor) {
    // Programatic content selection example
    editor.setSelection({
      startLineNumber: 1,
      startColumn: 1,
      endColumn: 50,
      endLineNumber: 3
    });
  }

  getCode() {
    return (
      // tslint:disable-next-line: max-line-length
      '<html><!-- // !!! Tokens can be inspected using F1 > Developer: Inspect Tokens !!! -->\n<head>\n	<!-- HTML comment -->\n	<style type="text/css">\n		/* CSS comment */\n	</style>\n	<script type="javascript">\n		// JavaScript comment\n	</' +
      'script>\n</head>\n<body></body>\n</html>'
    );
  }

  registerMonacoCustomTheme() {
    monaco.editor.defineTheme('myCustomTheme', {
      base: 'vs-dark', // can also be vs or hc-black
      inherit: true, // can also be false to completely replace the builtin rules
      rules: [
        {
          token: 'comment',
          foreground: 'ffa500',
          fontStyle: 'italic underline'
        },
        { token: 'comment.js', foreground: '008800', fontStyle: 'bold' },
        { token: 'comment.css', foreground: '0000ff' } // will inherit fontStyle from `comment` above
      ],
      colors: {}
    });
  }

  registerMonacoJsonSchemaValidator() {
    this.modelUri = monaco.Uri.parse('a://b/city.json');
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://myserver/city-schema.json', // id of the first schema
          fileMatch: ['city*.json'],
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              city: {
                enum: ['Paris', 'Berlin', 'Boardman']
              },
              country: {
                enum: ['France', 'Germany', 'United States']
              },
              population: {
                type: 'integer'
              }
            }
          }
        }
      ]
    });
  }
}
