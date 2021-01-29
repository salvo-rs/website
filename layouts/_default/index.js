var book = [
{{ range $index, $page := (where .Site.Pages "Section" "book") -}}
  {
    id: {{ $index }},
    title: "{{ .Title }}",
    description: "{{ .Params.description }}",
    href: "{{ .URL | absURL }}"
  },
{{ end -}}
];